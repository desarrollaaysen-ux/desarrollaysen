import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	draft: z.boolean().optional().default(false),
	// Slug (id) del post equivalente en el otro idioma, SOLO cuando existe una
	// traducción real y publicada. Se usa exclusivamente para generar
	// hreflang correcto entre artículos de blog (ver src/layouts/Layout.astro
	// y src/pages/{es,en}/blog/[slug].astro). Si no hay traducción, este
	// campo se omite y la página no emite alternativas de idioma.
	translationSlug: z.string().optional(),
});

const blogEs = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog/es' }),
	schema: blogSchema,
});

const blogEn = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog/en' }),
	schema: blogSchema,
});

export const collections = { blogEs, blogEn };
