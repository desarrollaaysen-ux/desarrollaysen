// Datos de los planes de servicio, compartidos entre la home (versión
// resumida) y la página de Servicios (versión completa), para no duplicar
// el contenido real entre ambas páginas ni entre idiomas.

export interface Plan {
	name: string;
	subtitle: string;
	forWhom: string;
	features: string[];
	delivery: string;
	highlight?: boolean;
}

export interface Maintenance {
	name: string;
	forWhom: string;
	features: string[];
}

export const plansEs: Plan[] = [
	{
		name: 'Plan Básico',
		subtitle: 'Presencia Digital',
		forWhom: 'Ideal si estás partiendo y necesitas una carta de presentación online simple y efectiva.',
		features: [
			'Sitio de una página, responsive',
			'Botón de WhatsApp',
			'Integración con Google Maps',
			'HTTPS y hosting del primer año incluido',
		],
		delivery: 'Entrega en 5-7 días hábiles',
	},
	{
		name: 'Plan Pro',
		subtitle: 'Presencia Profesional',
		forWhom: 'Para negocios que quieren mostrar todos sus servicios y captar consultas de forma más completa.',
		features: [
			'Hasta 5 páginas',
			'Formulario de contacto protegido contra spam',
			'SEO básico',
			'Integración con Google Business Profile',
			'HTTPS y hosting del primer año incluido',
		],
		delivery: 'Entrega en 10-15 días hábiles',
		highlight: true,
	},
];

export const maintenanceEs: Maintenance = {
	name: 'Mantención Mensual',
	forWhom: 'Para no preocuparte de nada una vez que tu sitio está publicado.',
	features: [
		'Hosting y dominio administrados',
		'Backups periódicos',
		'Actualizaciones de seguridad',
		'Hasta 2 cambios de contenido al mes',
		'Monitoreo de disponibilidad',
	],
};

export const plansEn: Plan[] = [
	{
		name: 'Basic Plan',
		subtitle: 'Digital Presence',
		forWhom: "Perfect if you're just starting out and need a simple, effective online presence.",
		features: [
			'One-page responsive site',
			'WhatsApp button',
			'Google Maps integration',
			'HTTPS and first-year hosting included',
		],
		delivery: 'Delivery in 5-7 business days',
	},
	{
		name: 'Pro Plan',
		subtitle: 'Professional Presence',
		forWhom: 'For businesses that want to showcase all their services and capture inquiries more effectively.',
		features: [
			'Up to 5 pages',
			'Spam-protected contact form',
			'Basic SEO',
			'Google Business Profile integration',
			'HTTPS and first-year hosting included',
		],
		delivery: 'Delivery in 10-15 business days',
		highlight: true,
	},
];

export const maintenanceEn: Maintenance = {
	name: 'Monthly Maintenance',
	forWhom: "So you don't have to worry about anything once your site is live.",
	features: [
		'Managed hosting and domain',
		'Periodic backups',
		'Security updates',
		'Up to 2 content changes per month',
		'Uptime monitoring',
	],
};
