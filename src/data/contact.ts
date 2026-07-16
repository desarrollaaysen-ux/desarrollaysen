// Datos de contacto centralizados. Todo el sitio debe importar desde acá —
// nunca repetir el número de WhatsApp ni el correo escritos a mano en un
// componente o página.
export const contactInfo = {
	// Casilla de contacto de Desarrolla Aysén, verificada en Cloudflare Email
	// Routing y usada como destino restringido del binding SEND_EMAIL del Worker.
	email: 'desarrollaaysen@gmail.com',

	// Número oficial de Desarrolla Aysén, en formato legible para mostrar en
	// pantalla.
	whatsapp: '+56 9 3418 4912',

	// Mismo número en formato E.164 sin espacios/símbolos, para construir el
	// link de wa.me.
	whatsappDigits: '56934184912',

	// Site key de Cloudflare Turnstile: NO es secreta, está diseñada para vivir
	// en el HTML/JS público (se usa para renderizar el widget en el navegador).
	// El secreto correspondiente (TURNSTILE_SECRET_KEY) está configurado
	// directamente como Worker Secret en Cloudflare, nunca en este archivo ni
	// en el repositorio.
	turnstileSiteKey: '0x4AAAAAAD3U85JKPBeBIpCy',
};

const whatsappMessageEs =
	'Hola, vi el sitio de Desarrolla Aysén y quisiera consultar por el desarrollo de una página web para mi negocio.';

const whatsappMessageEn =
	"Hi, I saw the Desarrolla Aysén website and I'd like to ask about web development for my business.";

/** Construye el link wa.me con el mensaje prellenado y correctamente codificado. */
export function getWhatsAppHref(lang: 'es' | 'en'): string {
	const message = lang === 'es' ? whatsappMessageEs : whatsappMessageEn;
	return `https://wa.me/${contactInfo.whatsappDigits}?text=${encodeURIComponent(message)}`;
}

export const contactCopyEs = {
	intro: 'Cuéntanos sobre tu proyecto y te ayudaremos a encontrar una solución adecuada para tu negocio.',
	availability: 'Puedes enviarnos tu consulta en cualquier momento.',
	responseTime: 'Normalmente respondemos dentro de 24 horas hábiles.',
	whatsappCta: 'Hablar por WhatsApp',
};

export const contactCopyEn = {
	intro: "Tell us about your project and we'll help you find the right solution for your business.",
	availability: 'You can send us your inquiry at any time.',
	responseTime: 'We typically respond within 24 business hours.',
	whatsappCta: 'Chat on WhatsApp',
};
