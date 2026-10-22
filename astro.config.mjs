// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The repository must be named habibafaisal.github.io so the site is served
  // from the root of the domain and no `base` path is needed.
  site: 'https://habibafaisal.github.io',

  // If you use a different repo name (e.g. "website"), the site is served at
  // https://habibafaisal.github.io/website/ and you must uncomment this line:
  // base: '/website',

  integrations: [sitemap()],

  markdown: {
    // Code blocks follow the reader's light/dark setting.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
