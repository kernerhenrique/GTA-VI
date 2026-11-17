// Verifica âncoras internas e links externos do build (dist/index.html).
// Uso: npm run build && node scripts/check-links.mjs
// (Na nuvem: NODE_USE_ENV_PROXY=1 node scripts/check-links.mjs — hosts bloqueados pela rede aparecem como "sem acesso".)
import { readFileSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = readFileSync(path.join(root, 'dist/index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
// ignora <link rel="preconnect|canonical|icon"> (não são links navegáveis) e a URL de placeholder do SITE_URL
const linkTags = new Set([...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]));
const site = process.env.SITE_URL || 'https://gta6-fan-br.example';
const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')).filter((h) => !linkTags.has(h) && !h.startsWith(site));
let bad = 0;
const anchors = [...new Set(hrefs.filter((h) => h.startsWith('#')))];
for (const a of anchors) if (a.length > 1 && !ids.has(a.slice(1))) { console.log('✘ âncora sem destino:', a); bad++; }
console.log(`Âncoras internas: ${anchors.length} verificadas, ${bad} quebradas`);
const locals = [...new Set([...hrefs, ...[...html.matchAll(/(?:src|srcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]))].filter((u) => u.startsWith('/') && !u.startsWith('//')))];
const { existsSync } = await import('node:fs');
let missing = 0;
for (const u of locals) { const f = path.join(root, 'dist', u.split('?')[0]); if (!existsSync(f)) { console.log('✘ arquivo local ausente:', u); missing++; } }
console.log(`Arquivos locais referenciados: ${locals.length}, ausentes: ${missing}`);
const external = [...new Set(hrefs.filter((h) => /^https?:\/\//.test(h)))];
const results = { ok: [], broken: [], blocked: [] };
const check = async (url) => {
  try {
    let r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (link checker)' } });
    if (r.status === 405 || r.status === 403 || r.status === 404) r = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (link checker)' } });
    // 401/403/429 = proteção anti-robô do site (o link existe para navegadores); 404/410/5xx = quebrado
    (r.ok ? results.ok : ([401, 403, 429, 999].includes(r.status) ? results.blocked : results.broken)).push(`${r.status} ${url}`);
  } catch (e) { results.blocked.push(`sem acesso (${e.cause?.code || e.name}) ${url}`); }
};
const queue = [...external];
await Promise.all(Array.from({ length: 8 }, async () => { while (queue.length) await check(queue.shift()); }));
console.log(`\nLinks externos: ${external.length} · OK: ${results.ok.length} · quebrados: ${results.broken.length} · não verificáveis daqui: ${results.blocked.length}`);
if (results.broken.length) console.log('Quebrados:\n ' + results.broken.join('\n '));
if (results.blocked.length) console.log('Não verificáveis (rede/anti-bot):\n ' + results.blocked.join('\n '));
process.exit(bad || missing || results.broken.length ? 1 : 0);
