export const defaultLang = 'es' as const;

export const languages = {
	es: 'Español',
	en: 'English',
} as const;

export type Lang = keyof typeof languages;

// Rutas por idioma para cada sección del sitio.
// Se usan tanto para la navegación (Header) como para el LanguageSwitcher.
export const routes = {
	es: {
		home: '/es/',
		services: '/es/servicios/',
		about: '/es/sobre-mi/',
		contact: '/es/contacto/',
		blog: '/es/blog/',
	},
	en: {
		home: '/en/',
		services: '/en/services/',
		about: '/en/about/',
		contact: '/en/contact/',
		blog: '/en/blog/',
	},
} as const;

// 'blogPost' no tiene entrada propia en `routes`: los posts individuales
// no siempre tienen equivalente 1:1 en el otro idioma, así que el
// LanguageSwitcher y el Header lo tratan como el índice del blog ('blog').
export type RouteKey = keyof typeof routes.es | 'blogPost';

export const ui = {
	es: {
		'nav.home': 'Inicio',
		'nav.services': 'Servicios',
		'nav.about': 'Sobre mí',
		'nav.contact': 'Contacto',
		'nav.blog': 'Blog',
		'footer.rights': 'Todos los derechos reservados.',
		'footer.tagline': 'Desarrollo web para pymes en Chile.',
		'lang.switch': 'Cambiar idioma',
	},
	en: {
		'nav.home': 'Home',
		'nav.services': 'Services',
		'nav.about': 'About',
		'nav.contact': 'Contact',
		'nav.blog': 'Blog',
		'footer.rights': 'All rights reserved.',
		'footer.tagline': 'Web development for small businesses in Chile.',
		'lang.switch': 'Switch language',
	},
} as const;
