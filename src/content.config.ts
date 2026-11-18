import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  // Files starting with "_" (e.g. _example-draft.md) are never loaded.
  loader: glob({ pattern: ['*/*.md', '!pages/*.md', '!*/_*.md'], base: './src/content' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: ['*.md'], base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { posts, pages };
