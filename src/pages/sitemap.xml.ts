/** sitemap.xml gerado a partir de src/data/pages.json. */
import type { APIRoute } from 'astro';
import { pages, pageHref, status } from '../lib/data';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://gta6-fan-br.example');
  const lastmod = status.updatedAt.slice(0, 10);
  const urls = ['', ...pages.map((p) => p.slug)].map((slug) =>
    `  <url><loc>${new URL(pageHref(slug), base).href}</loc><lastmod>${lastmod}</lastmod><priority>${slug ? '0.8' : '1.0'}</priority></url>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
