import { EmailMessage } from 'cloudflare:email';
import type { Env } from './index';

// ---------------------------------------------------------------------------
// Límites y constantes de validación
// ---------------------------------------------------------------------------
const LIMITS = {
	name: { min: 2, max: 100 },
	email: { min: 5, max: 150 },
	company: { max: 100 },
	phone: { max: 30 },
	message: { min: 10, max: 2000 },
};

const MAX_BODY_BYTES = 10_000; // suficiente para el formulario, descarta payloads anómalos
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-.\s]*$/;

const RATE_LIMIT_PER_IP_PER_HOUR = 5;
const RATE_LIMIT_MIN_INTERVAL_SECONDS = 20;
const DUPLICATE_WINDOW_SECONDS = 300;

const GENERIC_ERROR = 'No pudimos procesar tu solicitud. Intenta nuevamente más tarde.';

interface ContactPayload {
	name: string;
	email: string;
	company?: string;
	phone?: string;
	message: string;
	acceptPrivacy: boolean;
	turnstileToken: string;
	// Honeypot: un campo que un humano nunca debería completar.
	website?: string;
}

function jsonResponse(body: unknown, status: number): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

/**
 * Extrae un path relativo y seguro (nunca una URL absoluta a otro host) a
 * partir del header Referer, para redirigir de vuelta al visitante en el
 * envío tradicional (sin JS) del formulario. Si el Referer falta o no se
 * puede interpretar, cae a "/". Esto evita cualquier posibilidad de open
 * redirect: solo se usa el pathname+search, nunca el origin del Referer.
 */
function safeRedirectPath(refererHeader: string | null, resultFlag: 'ok' | 'error'): string {
	let path = '/';
	if (refererHeader) {
		try {
			const refererUrl = new URL(refererHeader);
			path = refererUrl.pathname || '/';
		} catch {
			path = '/';
		}
	}
	const separator = path.includes('?') ? '&' : '?';
	return `${path}${separator}contact=${resultFlag}`;
}

/**
 * Extrae el payload del formulario tanto si llega como JSON (envío normal vía
 * fetch, con JavaScript activo) como si llega como
 * application/x-www-form-urlencoded o multipart/form-data (envío nativo del
 * <form>, sin JavaScript — progressive enhancement). Ambos casos terminan en
 * la misma forma de datos y pasan por exactamente las mismas validaciones más
 * abajo. No se permiten adjuntos: si el multipart trae un campo de tipo
 * archivo, se rechaza.
 */
async function extractPayload(
	request: Request
): Promise<{ payload: ContactPayload; isJson: boolean } | { error: 'content-type' | 'too-large' | 'invalid' | 'file-not-allowed' }> {
	const contentType = request.headers.get('Content-Type') ?? '';

	const contentLengthHeader = request.headers.get('Content-Length');
	if (contentLengthHeader && Number(contentLengthHeader) > MAX_BODY_BYTES) {
		return { error: 'too-large' };
	}

	if (contentType.includes('application/json')) {
		const rawBody = await request.text();
		if (rawBody.length > MAX_BODY_BYTES) return { error: 'too-large' };
		try {
			const parsed = JSON.parse(rawBody);
			return {
				isJson: true,
				payload: {
					name: parsed.name,
					email: parsed.email,
					company: parsed.company,
					phone: parsed.phone,
					message: parsed.message,
					acceptPrivacy: parsed.acceptPrivacy,
					turnstileToken: parsed.turnstileToken,
					website: parsed.website,
				},
			};
		} catch {
			return { error: 'invalid' };
		}
	}

	if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
		let formData: FormData;
		try {
			formData = await request.formData();
		} catch {
			return { error: 'invalid' };
		}

		// No se permiten adjuntos bajo ninguna circunstancia.
		for (const value of formData.values()) {
			if (value instanceof File) {
				return { error: 'file-not-allowed' };
			}
		}

		const get = (key: string) => {
			const value = formData.get(key);
			return typeof value === 'string' ? value : undefined;
		};

		return {
			isJson: false,
			payload: {
				name: get('name') ?? '',
				email: get('email') ?? '',
				company: get('company'),
				phone: get('phone'),
				message: get('message') ?? '',
				acceptPrivacy: get('acceptPrivacy') === 'on' || get('acceptPrivacy') === 'true',
				turnstileToken: get('cf-turnstile-response') ?? '',
				website: get('website'),
			},
		};
	}

	return { error: 'content-type' };
}

/** Quita etiquetas HTML, caracteres de control y normaliza espacios. */
function sanitizeText(value: unknown, maxLength: number): string {
	if (typeof value !== 'string') return '';
	return value
		.replace(/<[^>]*>/g, '')
		// eslint-disable-next-line no-control-regex
		.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
		.replace(/[\r\n]+/g, ' ')
		.trim()
		.slice(0, maxLength);
}

async function hashString(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest('SHA-256', data);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Lectura de KV con fail-open: si KV falla (outage, timeout), no bloqueamos
 * el envío del formulario — Turnstile sigue siendo la defensa principal
 * contra abuso. Solo se pierde el rate limiting/dedupe durante el incidente.
 */
async function safeKvGet(kv: KVNamespace, key: string): Promise<string | null> {
	try {
		return await kv.get(key);
	} catch {
		console.log('contact_form: kv read failed');
		return null;
	}
}

/** Escritura de KV best-effort: un fallo aquí no debe afectar la respuesta al usuario. */
async function safeKvPut(kv: KVNamespace, key: string, value: string, ttlSeconds: number): Promise<void> {
	try {
		await kv.put(key, value, { expirationTtl: ttlSeconds });
	} catch {
		console.log('contact_form: kv write failed');
	}
}

async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
	if (!token || !secret) return false;
	try {
		const form = new FormData();
		form.append('secret', secret);
		form.append('response', token);
		if (ip) form.append('remoteip', ip);

		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: form,
		});
		const data = (await res.json()) as { success: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}

/** Codifica un asunto con acentos como RFC 2047 encoded-word (UTF-8 base64). */
function encodeSubject(subject: string): string {
	const base64 = btoa(unescape(encodeURIComponent(subject)));
	return `=?UTF-8?B?${base64}?=`;
}

function buildRawEmail(params: {
	from: string;
	to: string;
	subject: string;
	name: string;
	email: string;
	company: string;
	phone: string;
	message: string;
}): string {
	const bodyText = [
		'Nuevo mensaje desde el formulario de contacto de desarrollaysen.com',
		'',
		`Nombre: ${params.name}`,
		`Email: ${params.email}`,
		`Empresa: ${params.company || '(no indicada)'}`,
		`Teléfono: ${params.phone || '(no indicado)'}`,
		'',
		'Mensaje:',
		params.message,
	].join('\n');

	const bodyBase64 = btoa(unescape(encodeURIComponent(bodyText)));

	return [
		`From: Desarrolla Aysén <${params.from}>`,
		`To: <${params.to}>`,
		`Reply-To: <${params.email}>`,
		`Subject: ${encodeSubject(params.subject)}`,
		'MIME-Version: 1.0',
		'Content-Type: text/plain; charset=UTF-8',
		'Content-Transfer-Encoding: base64',
		'',
		bodyBase64,
	].join('\r\n');
}

export async function handleContactRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
	const referer = request.headers.get('Referer');

	// Formato de respuesta: JSON para el envío normal vía fetch (con JS);
	// redirect 303 same-path para el envío nativo del <form> (sin JS), para
	// que el visitante vuelva a la página de contacto sin exponer nada en la
	// URL (nunca se usan los datos del formulario en la respuesta, solo un
	// indicador genérico ok/error).
	const isJsonRequest = (request.headers.get('Content-Type') ?? '').includes('application/json');
	const respond = (ok: boolean, status: number, error?: string): Response => {
		if (!isJsonRequest) return new Response(null, { status: 303, headers: { Location: safeRedirectPath(referer, ok ? 'ok' : 'error') } });
		return jsonResponse(ok ? { ok: true } : { ok: false, error: error ?? GENERIC_ERROR }, status);
	};

	// --- Extrae el payload, ya sea JSON (fetch, con JS) o form-urlencoded/
	// multipart (envío nativo del <form>, sin JS). Ambos casos siguen
	// exactamente las mismas validaciones más abajo. ---
	const extracted = await extractPayload(request);

	if ('error' in extracted) {
		console.log(`contact_form: rejected (${extracted.error})`);
		const status = extracted.error === 'too-large' ? 413 : extracted.error === 'content-type' ? 415 : 400;
		return respond(false, status);
	}

	const { payload } = extracted;

	// --- Honeypot: si viene relleno, es un bot. Respondemos "éxito" genérico
	// sin enviar nada, para no revelar la detección. ---
	if (payload.website && payload.website.trim() !== '') {
		console.log('contact_form: honeypot triggered');
		return respond(true, 200);
	}

	// --- Rate limiting por IP (KV). Fail-open: si KV no responde, se continúa
	// sin bloquear (Turnstile sigue exigiéndose más abajo). ---
	const ipHash = await hashString(ip);
	const ipKey = `rl:ip:${ipHash}`;
	const lastSubmission = await safeKvGet(env.RATE_LIMIT, `rl:last:${ipHash}`);
	if (lastSubmission) {
		const elapsed = (Date.now() - Number(lastSubmission)) / 1000;
		if (elapsed < RATE_LIMIT_MIN_INTERVAL_SECONDS) {
			console.log('contact_form: rejected (too frequent)');
			return respond(false, 429);
		}
	}

	const currentCountRaw = await safeKvGet(env.RATE_LIMIT, ipKey);
	const currentCount = currentCountRaw ? Number(currentCountRaw) : 0;
	if (currentCount >= RATE_LIMIT_PER_IP_PER_HOUR) {
		console.log('contact_form: rejected (rate limit)');
		return respond(false, 429);
	}

	// --- Validación de campos ---
	const name = sanitizeText(payload.name, LIMITS.name.max);
	const email = sanitizeText(payload.email, LIMITS.email.max);
	const company = sanitizeText(payload.company, LIMITS.company.max);
	const phone = sanitizeText(payload.phone, LIMITS.phone.max);
	const message = sanitizeText(payload.message, LIMITS.message.max);

	const isValid =
		name.length >= LIMITS.name.min &&
		email.length >= LIMITS.email.min &&
		EMAIL_RE.test(email) &&
		PHONE_RE.test(phone) &&
		message.length >= LIMITS.message.min &&
		payload.acceptPrivacy === true;

	if (!isValid) {
		console.log('contact_form: rejected (validation)');
		return respond(false, 400, 'Revisa los datos ingresados e inténtalo de nuevo.');
	}

	// --- Anti-duplicados: mismo email + mensaje en una ventana corta ---
	const dupKey = `rl:dup:${await hashString(email + '|' + message)}`;
	const isDuplicate = await safeKvGet(env.RATE_LIMIT, dupKey);
	if (isDuplicate) {
		console.log('contact_form: rejected (duplicate)');
		return respond(true, 200); // respuesta genérica, no revela el motivo
	}

	// --- Turnstile ---
	const turnstileOk = await verifyTurnstile(payload.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
	if (!turnstileOk) {
		console.log('contact_form: rejected (turnstile)');
		return respond(false, 403);
	}

	// --- Envío del correo ---
	try {
		const raw = buildRawEmail({
			from: env.CONTACT_FROM_ADDRESS,
			to: 'desarrollaaysen@gmail.com',
			subject: 'Nuevo mensaje de contacto — Desarrolla Aysén',
			name,
			email,
			company,
			phone,
			message,
		});

		const msg = new EmailMessage(env.CONTACT_FROM_ADDRESS, 'desarrollaaysen@gmail.com', raw);
		await env.SEND_EMAIL.send(msg);
	} catch (err) {
		console.log('contact_form: error sending email');
		return respond(false, 502);
	}

	// --- Actualizar contadores de rate limit / dedupe (best-effort, no bloquea la respuesta) ---
	ctx.waitUntil(
		Promise.all([
			safeKvPut(env.RATE_LIMIT, ipKey, String(currentCount + 1), 3600),
			safeKvPut(env.RATE_LIMIT, `rl:last:${ipHash}`, String(Date.now()), 3600),
			safeKvPut(env.RATE_LIMIT, dupKey, '1', DUPLICATE_WINDOW_SECONDS),
		])
	);

	console.log('contact_form: sent ok');
	return respond(true, 200);
}
