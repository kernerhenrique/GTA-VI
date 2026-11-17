// Screenshots por seção (desktop e mobile) para revisão visual.
// Uso: node scripts/screenshots.mjs [baseUrl] [outDir]   (com `npm run preview` rodando)
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(require.resolve('playwright', { paths: ['/opt/node22/lib/node_modules', process.cwd()] })); }
const { chromium, devices } = pw;
const base = process.argv[2] || 'http://127.0.0.1:4321/';
const out = process.argv[3] || 'screenshots';
const query = process.argv[4] || '';
import { mkdirSync } from 'node:fs';
mkdirSync(out, { recursive: true });
const sections = ['topo', 'hub', 'comprar', 'historia', 'personagens', 'leonida', 'jogabilidade', 'musica', 'online', 'trailers', 'linha-do-tempo', 'recepcao', 'comparacoes', 'curiosidades', 'faq', 'fontes'];
const browser = await chromium.launch();
for (const [name, ctxOpts] of [
  ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }],
  ['mobile', { ...devices['iPhone 13'] }],
]) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + query, { waitUntil: 'networkidle' });
  // rola a página inteira para disparar reveals/lazy-load
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 600) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(120); }
  for (const id of sections) {
    const el = await page.$(`#${id}`);
    if (!el) continue;
    await el.scrollIntoViewIfNeeded();
    await page.evaluate((i) => document.getElementById(i).scrollIntoView({ block: 'start' }), id);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/${name}-${id}.png` });
  }
  console.log(name, 'altura:', H, errors.length ? `ERROS: ${errors.join(' | ')}` : 'sem erros no console');
  await ctx.close();
}
await browser.close();
