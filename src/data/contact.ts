// Datos de contacto centralizados. Todo el sitio debe importar desde acá —
// nunca repetir el número de WhatsApp ni el correo escritos a mano en un
// componente o página.
export const contactInfo = {
	// Correo profesional: todavía no está contratado/configurado (ver
	// comparación de Google Workspace / Zoho Mail). No publicar hasta que
	// exista un buzón real funcionando.
	email: '[CORREO PROFESIONAL PENDIENTE]',

	// Número oficial de Desarrolla Aysén, en formato legible para mostrar en
	// pantalla.
	whatsapp: '+56 9 3418 4912',

	// Mismo número en formato E.164 sin espacios/símbolos, para construir el
	// link de wa.me.
	whatsappDigits: '56934184912',
};

const whatsappMessageEs =
	'Hola, vi el sitio de Desarrolla Aysén y quisiera consultar por el desarrollo de una página web para mi negocio.';

const whatsappMessageEn =
	"Hi, I saw the Desarrolla Aysén website and I'd like to ask about web development for my business.";

/** Construye el link wa.me con el mensaje prellenado y correctamente codificado. */
export function getWhatsAppHref(lang: 'es' | 'en'): string {
	const message = lang === 'es' ? whatsappMessageE