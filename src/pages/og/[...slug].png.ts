// Open Graph images, generated at build time: /og/home.png, /og/work.png, /og/writing/<id>.png, ...
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg } from '../../lib/og';
import { getPosts, formatDate } from '../../lib/posts';
import { NAME } from '../../consts';

export const getStaticPaths = (async () => {
  // Section pages already carry the name bottom-right, so the subtitle is the site's host.
  const siteName = new URL(import.meta.env.SITE).host;
  const pages = [
    { slug: 'home', title: NAME, subtitle: 'Software engineer · Karachi' },
    { slug: 'work', title: 'Work', subtitle: siteName },
    { slug: 'writing', title: 'Writing', subtitle: siteName },
    { slug: 'about', title: 'About', subtitle: siteName },
    { slug: 'mellow', title: 'Mellow for Google Docs', subtitle: 'Dark mode and a writer sidebar' },
  ];
  const posts = (await getPosts()).map((p) => ({
    slug: `writing/${p.id}`,
    title: p.data.title,
    subtitle: formatDate(p.data.date),
  }));
  return [...pages, ...posts].map(({ slug, title, subtitle }) => ({
    params: { slug },
    props: { title, subtitle },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg({ title: props.title, subtitle: props.subtitle });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
