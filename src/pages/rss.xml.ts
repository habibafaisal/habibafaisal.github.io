import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts(); // drafts excluded
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const self = new URL(`${base}/rss.xml`, context.site).href;
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      categories: post.data.tags,
      link: `${base}/writing/${post.id}/`,
      content: sanitizeHtml(marked.parse(post.body ?? '', { async: false }), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      }),
    })),
    customData: `<language>en</language><atom:link href="${self}" rel="self" type="application/rss+xml" />`,
  });
}
