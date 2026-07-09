import { ui, defaultLang, type Lang } from './ui';

export function getLangFromUrl(url: URL): Lang {
	const [, lang] = url.pathname.split('/');
	if (lang === 'es' || lang === 'en') return lang;
	return defaultLang;
}

export function useTranslations(lang: Lang) {
	return function t(key: keyof (typeof ui)[typeof defaultLang]) {
		return ui[lang][key] ?? ui[defaultLang][key];
	};
}
