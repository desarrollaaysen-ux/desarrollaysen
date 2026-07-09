// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://desarrollaysen.com',

	integrations: [sitemap()],

	vite: {
		plugins: [tailwindcss()],
	},

	i18n: {
		defaultLocale: 'es',
		locales: ['es', 'en'],
		routing: {
			prefixDefaultLocale: true,
		},
	},

	// Redirección de la raíz "/" al idioma por defecto (español).
	// No hay detección automática del idioma del navegador: Astro i18n
	// no auto-detecta el idioma salvo que se implemente manualmente,
	// así que el sitio siempre carga en /es/ por defecto.
	redirects: {
		'/': '/es/',
	},
});
