import { handleContactRequest } from './contact';

export interface Env {
	ASSETS: Fetcher;
	RATE_LIMIT: KVNamespace;
	SEND_EMAIL: SendEmail;
	ALLOWED_ORIGIN: string;
	CONTACT_FROM_ADDRESS: string;
	TURNSTILE_SECRET_KEY: string;
}

// Orígenes permitidos para llamar a la API. En producción solo el dominio
// propio; en desarrollo local (wrangler dev / astro dev) se permite
// localhost para poder probar el formulario.
const DEV_ORIGINS = ['http://localhost:4321', 'http://127.0.0.1:4321'];

function isAllowedOrigin(origin: string | null, env: Env): boolean {
	if (!origin) return false;
	if (origin === env.ALLOWED_ORIGIN) return true;
	if (origin === env.ALLOWED_ORIGIN.replace('https://', 'https://www.')) return true;
	if (DEV_ORIGINS.includes(origin)) return true;
	return false;
}

function corsHeaders(origin: string | null, env: Env): HeadersInit {
	if (!isAllowedOrigin(origin, env)) return {};
	return {
		'Access-Control-Allow-Origin': origin as string,
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		Vary: 'Origin',
	};
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get('Origin');

		if (url.pathname === '/api/contact') {
			// Preflight CORS.
			if (request.method === 'OPTIONS') {
				return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
			}

			if (request.method !== 'POST') {
				return new Response(JSON.stringify({ ok: false, error: 'Método no permitido.' }), {
					status: 405,
					headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, env) },
				});
			}

			// Solo se aceptan solicitudes desde el propio sitio (o localhost en
			// desarrollo). Si el Origin no es válido, se rechaza sin dar detalle.
			if (!isAllowedOrigin(origin, env)) {
				return new Response(JSON.stringify({ ok: false, error: 'Solicitud no permitida.' }), {
					status: 403,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const response = await handleContactRequest(request, env, ctx);
			const headers = new Headers(response.headers);
			for (const [key, value] of Object.entries(corsHeaders(origin, env))) {
				headers.set(key, value as string);
			}
			return new Response(response.body, { status: response.status, headers });
		}

		// Cualquier otra ruta: servir el sitio estático generado por Astro.
		return env.ASSETS.fetch(request);
	},
};
