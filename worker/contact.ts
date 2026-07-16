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

	// --- Content-Type: solo JSON. Rechaza cualquier multipart (archivos). ---
	const contentType = request.headers.get('Content-Type') ?? '';
	if (!contentType.includes('application/json')) {
		console.log('contact_form: rejected (content-type)');
		return jsonResponse({ ok: false, error: GENERIC_ERROR }, 415);
	}

	const rawBody = await request.text();
	if (rawBody.length > MAX_BODY_BYTES) {
		console.log('contact_form: rejected (payload too large)');
		return jsonResponse({ ok: false, error: GENERIC_ERROR }, 413);
	}

	let payload: ContactPayload;
	try {
		payload = JSON.parse(rawBody);
	} catch {
		console.log('contact_form: rejected (invalid json)');
		return jsonResponse({ ok: false, error: GENERIC_ERROR }, 400);
	}

	// --- Honeypot: si viene relleno, es un bot. Respondemos "éxito" genérico
	// sin enviar nada, para no revelar la detección. ---
	if (payload.website && payload.website.trim() !== '') {
		console.log('contact_form: honeypot triggered');
		return jsonResponse({ ok: true }, 200);
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
			return jsonResponse({ ok: false, error: GENERIC_ERROR }, 429);
		}
	}

	const currentCountRaw = await safeKvGet(env.RATE_LIMIT, ipKey);
	const currentCount = currentCountRaw ? Number(currentCountRaw) : 0;
	if (currentCount >= RATE_LIMIT_PER_IP_PER_HOUR) {
		console.log('contact_form: rejected (rate limit)');
		return jsonResponse({ ok: false, error: GENERIC_ERROR }, 429);
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
		return jsonResponse({ ok: false, error: 'Revisa los datos ingresados e inténtalo de nuevo.' }, 400);
	}

	// --- Anti-duplicados: mismo email + mensaje en una ventana corta ---
	const dupKey = `rl:dup:${await hashString(email + '|' + message)}`;
	const isDuplicate = await safeKvGet(env.RATE_LIMIT, dupKey);
	if (isDuplicate) {
		console.log('contact_form: rejected (duplicate)');
		return jsonResponse({ ok: true }, 200); // respuesta genérica, no revela el motivo
	}

	// --- Turnstile ---
	const turnstileOk = await verifyTurnstile(payload.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
	if (!turnstileOk) {
		console.log('contact_form: rejected (turnstile)');
		return jsonResponse({ ok: false, error: GENERIC_ERROR }, 403);
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
		return jsonResponse({ ok: false, error: GENERIC_ERROR }, 502);
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
	return jsonResponse({ ok: true }, 200);
}
