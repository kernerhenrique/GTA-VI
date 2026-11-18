// Verifica os links de TODAS as páginas do build (dist/*.html):
// - links internos entre páginas (/comprar, /trailers#trailer-launch, #hub): a página existe e o id existe nela;
// - arquivos locais (imagens, scripts, vídeos);
// - links externos (HEAD/GET; 401/403/429 = proteção anti-robô, "não verificável daqui").
// Uso: npm run build && node scripts/check-links.mjs   (na nuvem: NODE_USE_ENV_PROXY=1 node scripts/check-links.mjs)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const site = process.env.SITE_URL || 'https://gta6-fan-br.example';

const htmlFiles = readdirSync(dist).filter((f) => f.endsWith('.html'));
const routeOf = (f) => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));
const pages = new Map(); // rota -> { html, ids }
for (const f of htmlFiles) {
  const html = readFileSync(path.join(dist, f), 'utf8');
  pages.set(routeOf(f), { file: f, html, ids: new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])) });
}
const fileFor = (route) => {
  if (pages.has(route)) return route;
  const r = route.replace(/\/$/, '').replace(/\.html$/, '') || '/';
  return pages.has(r) ? r : null;
};

let badInternal = 0, internalCount = 0;
const locals = new Set();
const external = new Set();
for (const [route, { html }] of pages) {
  // ignora <link rel="preconnect|canonical|icon|sitemap"> e a URL absoluta do próprio site
  const linkTags = new Set([...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]));
  const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')).filter((h) => !linkTags.has(h) && !h.startsWith(site));
  for (const h of hrefs) {
    if (/^https?:\/\//.test(h)) { external.add(h); continue; }
    if (/^(mailto|tel):/.test(h)) continue;
    if (h.startsWith('#') || (h.startsWith('/') && !h.startsWith('//'))) {
      const u = new URL(h, `https://x${route}`);
      const assetLike = /\.[a-z0-9]{2,5}$/i.test(u.pathname) && !u.pathname.endsWith('.html');
      if (assetLike) { locals.add(u.pathname); continue; }
      internalCount++;
      const target = fileFor(u.pathname);
      if (!target) { console.log(`✘ ${route} → ${h}: página não existe`); badInternal++; continue; }
      const id = decodeURIComponent(u.hash.slice(1));
      if (id && !pages.get(target).ids.has(id)) { console.log(`✘ ${route} → ${h}: âncora #${id} não existe em ${target}`); badInternal++; }
    }
  }
  for (const m of html.matchAll(/(?:src|srcset|poster)="([^"]+)"/g)) {
    for (const part of m[1].split(',')) { const u = part.trim().split(' ')[0]; if (u.startsWith('/') && !u.startsWith('//')) locals.add(u.split('?')[0]); }
  }
}
console.log(`Páginas: ${pages.size} · links internos: ${internalCount} verificados, ${badInternal} quebrados`);
let missing = 0;
for (const u of locals) if (!existsSync(path.join(dist, decodeURIComponent(u)))) { console.log('✘ arquivo local ausente:', u); missing++; }
console.log(`Arquivos locais referenciados: ${locals.size}, ausentes: ${missing}`);

const results = { ok: [], broken: [], blocked: [] };
const check = async (url) => {
  try {
    const opts = { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (link checker)' } };
    let r = await fetch(url, { method: 'HEAD', ...opts });
    if ([403, 404, 405].includes(r.status)) r = await fetch(url, { method: 'GET', ...opts });
    (r.ok ? results.ok : ([401, 403, 429, 999].includes(r.status) ? results.blocked : results.broken)).push(`${r.status} ${url}`);
  } catch (e) { results.blocked.push(`sem acesso (${e.cause?.code || e.name}) ${url}`); }
};
if (process.argv.includes('--no-external')) {
  console.log(`Links externos: ${external.size} (não verificados: --no-external)`);
} else {
  const queue = [...external];
  await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await check(queue.shift()); }));
  console.log(`\nLinks externos: ${external.size} · OK: ${results.ok.length} · quebrados: ${results.broken.length} · não verificáveis daqui: ${results.blocked.length}`);
  if (results.broken.length) console.log('Quebrados:\n ' + results.broken.join('\n '));
  if (results.blocked.length) console.log('Não verificáveis (rede/anti-bot):\n ' + results.blocked.join('\n '));
}
process.exit(badInternal || missing || results.broken.length ? 1 : 0);
