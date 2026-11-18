// Screenshots de cada página (desktop e celular) + menus abertos, para revisão visual.
// Uso: node scripts/screenshots.mjs [baseUrl] [outDir] [--full]   (com `npm run preview` rodando)
//   --full também salva a página inteira (arquivos maiores).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const full = process.argv.includes('--full');
const base = (args[0] || 'http://127.0.0.1:4321/').replace(/\/$/, '');
const out = args[1] || 'screenshots';
mkdirSync(out, { recursive: true });
const { pages } = JSON.parse(readFileSync(new URL('../src/data/pages.json', import.meta.url), 'utf8'));
const routes = ['', ...pages.map((p) => p.slug)];

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
  for (const r of routes) {
    const slug = r || 'inicio';
    await page.goto(`${base}/${r}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/${name}-${slug}.png` });
    if (full) {
      // rola a página inteira para disparar reveals e lazy-load
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += 700) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(100); }
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${out}/${name}-${slug}-full.png`, fullPage: true });
    }
  }
  // menus abertos
  await page.goto(`${base}/leonida`, { waitUntil: 'networkidle' });
  if (name === 'desktop') {
    await page.click('[data-mega-btn]');
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/${name}-menu-o-jogo.png` });
  } else {
    await page.click('[data-menu-btn]');
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/${name}-menu.png` });
  }
  console.log(name, errors.length ? `ERROS: ${errors.join(' | ')}` : 'sem erros no console');
  await ctx.close();
}
await browser.close();
