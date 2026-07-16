// Lógica del formulario de contacto.
// Archivo estático servido tal cual desde /scripts/contact-form.js (no pasa
// por el bundler de Astro/Vite), cargado con
// <script is:inline type="module" src="/scripts/contact-form.js"> para
// garantizar que quede como recurso externo bajo el mismo origen y así
// respetar la CSP script-src 'self' sin necesidad de 'unsafe-inline'.
// No usar TypeScript ni imports acá: debe poder servirse tal cual.

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('contact-status');
const submitBtn = document.getElementById('contact-submit');

if (form instanceof HTMLFormElement) {
	let labels = { sending: '', success: '', error: '' };
	try {
		labels = { ...labels, ...JSON.parse(form.dataset.labels || '{}') };
	} catch {
		// Si el JSON viniera corrupto, seguimos con textos vacíos antes que
		// romper el envío del formulario.
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();

		const formData = new FormData(form);
		const turnstileToken = formData.get('cf-turnstile-response');

		submitBtn?.setAttribute('disabled', 'true');
		if (statusEl) {
			statusEl.textContent = labels.sending;
			statusEl.className = 'text-sm text-slate-500';
		}

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: formData.get('name'),
					email: formData.get('email'),
					company: formData.get('company'),
					phone: formData.get('phone'),
					message: formData.get('message'),
					acceptPrivacy: formData.get('acceptPrivacy') === 'on',
					website: formData.get('website'),
					turnstileToken,
				}),
			});

			const data = await res.json().catch(() => ({ ok: false }));

			if (res.ok && data.ok) {
				if (statusEl) {
					statusEl.textContent = labels.success;
					statusEl.className = 'text-sm text-emerald-600';
				}
				form.reset();
			} else if (statusEl) {
				statusEl.textContent = data.error || labels.error;
				statusEl.className = 'text-sm text-red-600';
			}
		} catch {
			if (statusEl) {
				statusEl.textContent = labels.error;
				statusEl.className = 'text-sm text-red-600';
			}
		} finally {
			submitBtn?.removeAttribute('disabled');
			if (window.turnstile) {
				window.turnstile.reset();
			}
		}
	});
}
