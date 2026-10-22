import { getCollection } from 'astro:content';

/** All published posts, newest first. Drafts are excluded everywhere via this helper. */
export async function getPosts() {
  const posts = await getCollection('writing', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date) {
  // Dates are stored as UTC midnight; format in UTC so they don't shift a day.
  return date.toISOString().slice(0, 10);
}

/** Prefix an internal path with the configured base (works with or without `base`). */
export function url(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
