// Datos de los planes de servicio, compartidos entre la home (versión
// resumida) y la página de Servicios (versión completa), para no duplicar
// el contenido real entre ambas páginas ni entre idiomas.

export interface Plan {
	name: string;
	subtitle: string;
	price: string;
	forWhom: string;
	features: string[];
	delivery: string;
	highlight?: boolean;
}

export interface Maintenance {
	name: string;
	price: string;
	forWhom: string;
	features: string[];
}

export const plansEs: Plan[] = [
	{
		name: 'Plan Básico',
		subtitle: 'Presencia Digital',
		price: 'Desde $159.990',
		forWhom: 'Ideal si estás comenzando y necesitas una carta de presentación online simple y efectiva.',
		features: [
			'Sitio de una página, adaptable a celulares, tabletas y computadoras',
			'Botón de WhatsApp',
			'Integración con Google Maps',
			'HTTPS y hosting administrado durante el primer año',
		],
		delivery: 'Entrega en 5-7 días hábiles',
	},
	{
		name: 'Plan Pro',
		subtitle: 'Presencia Profesional',
		price: 'Desde $299.990',
		forWhom: 'Para negocios que quieren mostrar todos sus servicios y captar consultas de forma más completa.',
		features: [
			'Hasta 5 páginas',
			'Formulario de contacto protegido contra spam',
			'SEO básico',
			'Integración con Google Business Profile',
			'HTTPS y hosting administrado durante el primer año',
		],
		delivery: 'Entrega en 10-15 días hábiles',
		highlight: true,
	},
];

export const maintenanceEs: Maintenance = {
	name: 'Mantenimiento Mensual',
	price: 'Desde $34.990 al mes',
	forWhom: 'Para no preocuparte de nada una vez que tu sitio está publicado.',
	features: [
		'Administración del hosting y el dominio',
		'Respaldos periódicos',
		'Actualizaciones de seguridad',
		'Hasta 2 cambios de contenido al mes',
		'Monitoreo de disponibilidad',
	],
};

export const plansEn: Plan[] = [
	{
		name: 'Basic Plan',
		subtitle: 'Digital Presence',
		price: 'From CLP $159,990',
		forWhom: "Perfect if you're just starting out and need a simple, effective online presence.",
		features: [
			'One-page responsive site',
			'WhatsApp button',
			'Google Maps integration',
			'HTTPS and managed hosting for the first year',
		],
		delivery: 'Delivery in 5-7 business days',
	},
	{
		name: 'Pro Plan',
		subtitle: 'Professional Presence',
		price: 'From CLP $299,990',
		forWhom: 'For businesses that want to showcase all their services and capture inquiries more effectively.',
		features: [
			'Up to 5 pages',
			'Spam-protected contact form',
			'Basic SEO',
			'Google Business Profile integration',
			'HTTPS and managed hosting for the first year',
		],
		delivery: 'Delivery in 10-15 business days',
		highlight: true,
	},
];

export const maintenanceEn: Maintenance = {
	name: 'Monthly Maintenance',
	price: 'From CLP $34,990',
	forWhom: "So you don't have to worry about anything once your site is live.",
	features: [
		'Managed hosting and domain',
		'Periodic backups',
		'Security updates',
		'Up to 2 content changes per month',
		'Uptime monitoring',
	],
};
