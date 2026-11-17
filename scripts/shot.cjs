// Captura rápida: node scripts/shot.cjs <url> <out.png> [width] [height] [fullPage] [reducedMotion]
const { chromium } = require('playwright');
(async () => {
  const [url, out, w = '1440', h = '900', full = '0', rm = '0'] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, reducedMotion: rm === '1' ? 'reduce' : 'no-preference' });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: out, fullPage: full === '1' });
  if (errs.length) console.log('ERROS:', errs.join('\n'));
  await b.close();
})();
