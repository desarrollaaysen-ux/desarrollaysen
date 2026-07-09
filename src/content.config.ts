import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	draft: z.boolean().optional().default(false),
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
