// Datos de los planes de servicio, compartidos entre la home (versión
// resumida) y la página de Servicios (versión completa), para no duplicar
// el contenido real entre ambas páginas ni entre idiomas.
//
// Modelo comercial (actualizado): el desarrollo del sitio se cobra como pago
// único (plansEs/plansEn). El dominio, el hosting y el SSL son un costo
// anual aparte, a precio de proveedor (hostingEs/hostingEn). El mantenimiento
// mensual es opcional (maintenanceEs/maintenanceEn). La forma de pago del
// desarrollo es 50% de anticipo + 50% contra entrega (paymentTermsEs/En).

export interface Plan {
	name: string;
	subtitle: string;
	price: string;
	priceNote: string;
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

export interface AnnualCost {
	name: string;
	price: string;
	description: string;
}

export const plansEs: Plan[] = [
	{
		name: 'Plan Esencial',
		subtitle: 'Presencia Digital',
		price: 'Desde $90.000',
		priceNote: 'Pago único',
		forWhom: 'Ideal si estás comenzando y necesitas una presencia online simple y efectiva.',
		features: [
			'Sitio de una página, adaptable a celulares, tabletas y computadoras',
			'Botón directo de WhatsApp',
			'Integración con Google Maps y horarios de atención',
			'Sección de servicios, productos o catálogo básico',
			'Dominio propio y configuración inicial en Google',
			'HTTPS (SSL) incluido',
		],
		delivery: 'Entrega en 5-7 días hábiles',
	},
	{
		name: 'Plan Completo',
		subtitle: 'Presencia Profesional',
		price: 'Desde $160.000',
		priceNote: 'Pago único',
		forWhom: 'Para negocios que quieren mostrar todos sus servicios y captar más consultas.',
		features: [
			'Todo lo del Plan Esencial',
			'Hasta 5 páginas: inicio, servicios, nosotros, galería y contacto',
			'Formulario de contacto protegido contra spam',
			'Galería de fotos',
			'SEO local reforzado e integración con Google Business Profile',
		],
		delivery: 'Entrega en 10-15 días hábiles',
		highlight: true,
	},
	{
		name: 'Plan Avanzado',
		subtitle: 'Presencia Ampliada',
		price: 'Desde $250.000',
		priceNote: 'Pago único',
		forWhom: 'Para negocios que necesitan funciones adicionales o quieren llegar a público internacional.',
		features: [
			'Todo lo del Plan Completo',
			'Sistema de reservas o agendamiento en línea',
			'Versión bilingüe español-inglés',
			'Analítica básica de visitas y consultas',
			'Integraciones adicionales según el negocio',
		],
		delivery: 'Entrega a coordinar según el alcance del proyecto',
	},
];

export const hostingEs: AnnualCost = {
	name: 'Dominio, hosting y SSL',
	price: 'Desde $50.000 al año',
	description:
		'Costo anual a precio de proveedor, sin recargo. El dominio y el hosting quedan a tu nombre. El primer año se suma al pago inicial del proyecto; desde el segundo año solo renuevas este valor.',
};

export const maintenanceEs: Maintenance = {
	name: 'Mantenimiento Mensual',
	price: 'Desde $30.000 al mes',
	forWhom: 'Opcional: tu sitio queda funcionando sin obligación de contratarla.',
	features: [
		'Administración del hosting y el dominio',
		'Respaldos periódicos',
		'Actualizaciones de seguridad',
		'Monitoreo de disponibilidad',
		'Hasta 2 cambios de contenido al mes',
	],
};

export const paymentTermsEs =
	'Forma de pago: 50% de anticipo para reservar tu proyecto y comenzar a trabajar, 50% restante al finalizar y publicar el sitio. El plazo de entrega se cuenta desde la confirmación y el pago del anticipo.';

export const plansEn: Plan[] = [
	{
		name: 'Essential Plan',
		subtitle: 'Digital Presence',
		price: 'From CLP $90,000',
		priceNote: 'One-time payment',
		forWhom: "Perfect if you're just starting out and need a simple, effective online presence.",
		features: [
			'One-page site, optimized for mobile, tablet and desktop',
			'Direct WhatsApp button',
			'Google Maps integration and business hours',
			'Basic services, products or menu section',
			'Your own domain and initial Google setup',
			'HTTPS (SSL) included',
		],
		delivery: 'Delivery in 5-7 business days',
	},
	{
		name: 'Complete Plan',
		subtitle: 'Professional Presence',
		price: 'From CLP $160,000',
		priceNote: 'One-time payment',
		forWhom: 'For businesses that want to showcase all their services and capture more inquiries.',
		features: [
			'Everything in the Essential Plan',
			'Up to 5 pages: home, services, about, gallery and contact',
			'Spam-protected contact form',
			'Photo gallery',
			'Reinforced local SEO and Google Business Profile integration',
		],
		delivery: 'Delivery in 10-15 business days',
		highlight: true,
	},
	{
		name: 'Advanced Plan',
		subtitle: 'Extended Presence',
		price: 'From CLP $250,000',
		priceNote: 'One-time payment',
		forWhom: 'For businesses that need extra features or want to reach international customers.',
		features: [
			'Everything in the Complete Plan',
			'Online booking / scheduling system',
			'Bilingual Spanish–English version',
			'Basic analytics for visits and inquiries',
			'Additional integrations depending on your business',
		],
		delivery: 'Delivery timeline to be defined based on project scope',
	},
];

export const hostingEn: AnnualCost = {
	name: 'Domain, hosting and SSL',
	price: 'From CLP $50,000 per year',
	description:
		'Annual cost at supplier price, no markup. The domain and hosting are registered in your name. The first year is added to the initial payment; from the second year on, you only renew this cost.',
};

export const maintenanceEn: Maintenance = {
	name: 'Monthly Maintenance',
	price: 'From CLP $30,000 per month',
	forWhom: "Optional: your site keeps working with no obligation to hire it.",
	features: [
		'Hosting and domain management',
		'Regular backups',
		'Security updates',
		'Uptime monitoring',
		'Up to 2 content changes per month',
	],
};

export const paymentTermsEn =
	'Payment terms: 50% upfront to reserve your project and get started, 50% due when the site is finished and published. The delivery timeline is counted from confirmation and payment of the deposit.';
