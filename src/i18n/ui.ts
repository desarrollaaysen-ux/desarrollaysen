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
		privacy: '/es/privacidad/',
	},
	en: {
		home: '/en/',
		services: '/en/services/',
		about: '/en/about/',
		contact: '/en/contact/',
		blog: '/en/blog/',
		privacy: '/en/privacy/',
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
		'nav.about': 'Nosotros',
		'nav.contact': 'Contacto',
		'nav.blog': 'Blog',
		'nav.menu': 'Menú',
		'footer.rights': 'Todos los derechos reservados.',
		'footer.tagline': 'Sitios web rápidos, seguros y a la medida para pymes y emprendedores en Chile.',
		'footer.servicesHeading': 'Servicios',
		'footer.companyHeading': 'Empresa',
		'footer.contactHeading': 'Contacto',
		'lang.switch': 'Cambiar idioma',
		'blog.backToBlog': 'Volver al blog',
		'blog.related': 'Artículos relacionados',
		'blog.readMore': 'Leer más',
		'footer.privacy': 'Política de Privacidad',
	},
	en: {
		'nav.home': 'Home',
		'nav.services': 'Services',
		'nav.about': 'About us',
		'nav.contact': 'Contact',
		'nav.blog': 'Blog',
		'nav.menu': 'Menu',
		'footer.rights': 'All rights reserved.',
		'footer.tagline': 'Fast, secure, custom websites for small businesses and entrepreneurs in Chile.',
		'footer.servicesHeading': 'Services',
		'footer.companyHeading': 'Company',
		'footer.contactHeading': 'Contact',
		'lang.switch': 'Switch language',
		'blog.backToBlog': 'Back to blog',
		'blog.related': 'Related articles',
		'blog.readMore': 'Read more',
		'footer.privacy': 'Privacy Policy',
	},
} as const;
