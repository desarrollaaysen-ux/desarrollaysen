// Menú hamburguesa: JS mínimo, sin dependencias, progressive enhancement
// (si el script no carga, la nav de escritorio sigue funcionando y en
// mobile el visitante puede navegar igual entrando a cada página).
//
// Archivo estático servido tal cual desde /scripts/mobile-menu.js (no pasa
// por el bundler de Astro/Vite), cargado con
// <script is:inline type="module" src="/scripts/mobile-menu.js"> para
// garantizar que quede como recurso externo bajo el mismo origen y así
// respetar la CSP script-src 'self' sin necesidad de 'unsafe-inline'.
// No usar TypeScript ni imports acá: debe poder servirse tal cual.

const toggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
const iconOpen = document.getElementById('icon-open');
const iconClose = document.getElementById('icon-close');

toggle?.addEventListener('click', () => {
	const isOpen = toggle.getAttribute('aria-expanded') === 'true';
	toggle.setAttribute('aria-expanded', String(!isOpen));
	mobileNav?.classList.toggle('hidden', isOpen);
	mobileNav?.classList.toggle('flex', !isOpen);
	iconOpen?.classList.toggle('hidden', !isOpen);
	iconClose?.classList.toggle('hidden', isOpen);
});
