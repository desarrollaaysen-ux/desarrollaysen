// Datos de contacto centralizados. Reemplaza estos dos valores cuando estén
// definidos — todas las páginas (Contacto, y cualquier otra que los use) los
// toman de acá, así que no hay que tocarlos en más de un lugar.
export const contactInfo = {
	email: '[CORREO PROFESIONAL PENDIENTE]',
	whatsapp: '[NÚMERO DE WHATSAPP PENDIENTE]',
	// Cuando el número de WhatsApp esté definido (formato internacional, solo
	// dígitos, ej: "56912345678"), completar acá para generar el link wa.me
	// automáticamente. Mientras tanto queda null y no se muestra el botón.
	whatsappHref: null as string | null,
};

export const contactCopyEs = {
	intro: 'Cuéntanos sobre tu proyecto y te ayudaremos a encontrar una solución adecuada para tu negocio.',
	availability: 'Puedes enviarnos tu consulta en cualquier momento.',
	responseTime: 'Normalmente respondemos dentro de 24 horas hábiles.',
};

export const contactCopyEn = {
	intro: "Tell us about your project and we'll help you find the right solution for your business.",
	availability: 'You can send us your inquiry at any time.',
	responseTime: 'We typically respond within 24 business hours.',
};
