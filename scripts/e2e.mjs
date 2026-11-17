// Teste do contador em três momentos (antes, no exato T-0 e depois), com relógio simulado do Playwright.
// Uso: npm run preview (em outro terminal) && node scripts/e2e.mjs [baseUrl] [pastaScreenshots]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:4321/';
const out = process.argv[3] || 'screenshots';
mkdirSync(out, { recursive: true });
const RELEASE = Date.parse('2026-11-19T00:00:00-03:00');
let failures = 0;
const check = (cond, msg) => { console.log(`${cond ? '✔' : '✘'} ${msg}`); if (!cond) failures++; };

const browser = await chromium.launch();
async function open(fixedIso, { tz = 'America/Sao_Paulo', install = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: tz });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  if (install) await page.clock.install({ time: new Date(fixedIso) });
  await page.goto(base + '#hub', { waitUntil: 'networkidle' });
  return { ctx, page, errors };
}
const tiles = (page) => page.$$eval('[data-flap] .flap-top > span', (els) => els.map((e) => e.textContent).join(''));
const state = (page) => page.evaluate(() => document.documentElement.dataset.launch);

// 1) ANTES: 18/11 12:00 BRT
{
  const { ctx, page, errors } = await open('2026-11-18T12:00:00-03:00');
  await page.clock.runFor(1500);
  check((await state(page)) === 'pre', 'ANTES: estado "pre"');
  const t1 = await tiles(page);
  check(/^(0011595\d|00120000)$/.test(t1), `ANTES: painel mostra ~00d 12h 00m 00s (obtido: ${t1})`);
  check(await page.isVisible('text=Contagem para Leonida'), 'ANTES: título "Contagem para Leonida" visível');
  check(!(await page.isVisible('[data-live]')), 'ANTES: bloco "Disponível agora" escondido');
  check(errors.length === 0, `ANTES: sem erros de JS ${errors.join(' | ')}`);
  await page.screenshot({ path: `${out}/e2e-1-antes.png` });
  await ctx.close();
}
// 2) EXATO MOMENTO: começa 10 s antes e deixa o relógio correr até T-0 com a página aberta
{
  const { ctx, page, errors } = await open('2026-11-18T23:59:50-03:00');
  await page.clock.runFor(1200);
  check((await state(page)) === 'pre', 'T-10s: ainda "pre"');
  const t2 = await tiles(page);
  check(/^0000000\d$/.test(t2), `T-10s: faltam menos de 10 segundos (obtido: ${t2})`);
  await page.clock.runFor(9500);
  await page.waitForTimeout(100);
  check((await state(page)) === 'launching', 'T-0: estado "launching" (animação de liberação)');
  check(await page.$eval('[data-dot-wipe]', (e) => e.classList.contains('is-on')), 'T-0: transição Dot Wipe disparada');
  await page.clock.runFor(4000); await page.waitForTimeout(400);
  check((await tiles(page)) === 'LIBERADO', `T-0: painel virou LIBERADO (obtido: ${await tiles(page)})`);
  await page.screenshot({ path: `${out}/e2e-2-t0.png` });
  await page.clock.runFor(12000); await page.waitForTimeout(200);
  check((await state(page)) === 'live', 'T+12s: estado "live" (DISPONÍVEL AGORA)');
  check(await page.isVisible('[data-live]'), 'T+12s: bloco "Disponível agora" visível');
  check(errors.length === 0, `T-0: sem erros de JS ${errors.join(' | ')}`);
  await ctx.close();
}
// 3) DEPOIS: quem abre o site 6 dias depois vê direto o estado DISPONÍVEL
{
  const { ctx, page, errors } = await open('2026-11-25T15:30:00-03:00');
  await page.clock.runFor(1500);
  check((await state(page)) === 'live', 'DEPOIS: estado "live" já no carregamento');
  check((await tiles(page)) === 'LIBERADO', 'DEPOIS: painel mostra LIBERADO sem animação');
  const since = await page.textContent('[data-since]');
  check(/^6d 15h 30m/.test(since ?? ''), `DEPOIS: tempo desde o lançamento = ${since}`);
  check(await page.isVisible('text=Disponível agora'), 'DEPOIS: título "Disponível agora"');
  const future = await page.$$eval('[data-tl-item].is-future', (els) => els.map((e) => e.getAttribute('data-date')));
  await page.click('.site-nav a[href="#linha-do-tempo"]'); // navegação real pelo menu
  await page.clock.runFor(3000); await page.waitForTimeout(1500);
  const top = await page.evaluate(() => document.getElementById('linha-do-tempo').getBoundingClientRect().top);
  check(top > -80 && top < 160, `Menu → "Linha do tempo" cai no lugar certo (topo da seção a ${Math.round(top)}px)`);
  const future2 = await page.$$eval('[data-tl-item].is-future', (els) => els.map((e) => e.getAttribute('data-date')));
  check(future2.length === 1 && future2[0] === '2026-12-11', `DEPOIS: linha do tempo só tem 1 evento futuro (álbum do Justice): ${JSON.stringify(future2)}`);
  await page.click('.site-nav a[href="#faq"]');
  await page.clock.runFor(200); await page.waitForTimeout(800);
  const topFaq = await page.evaluate(() => document.getElementById('faq').getBoundingClientRect().top);
  check(topFaq > -80 && topFaq < 160, `Menu → "FAQ" cai no lugar certo (topo da seção a ${Math.round(topFaq)}px)`);
  check(errors.length === 0, `DEPOIS: sem erros de JS ${errors.join(' | ')}`);
  await page.screenshot({ path: `${out}/e2e-3-depois.png` });
  void future;
  await ctx.close();
}
// 4) Simulação por URL e fuso de outro país
{
  const ctx = await browser.newContext({ timezoneId: 'Europe/Lisbon' });
  const page = await ctx.newPage();
  await page.goto(base + '?agora=2026-11-19T00:00:05-03:00#hub', { waitUntil: 'networkidle' });
  check((await state(page)) === 'launching', '?agora= simula o T-0 (estado "launching")');
  check(await page.isVisible('[data-sim-banner]'), '?agora= mostra a faixa MODO SIMULAÇÃO');
  const local = await page.textContent('[data-local-time]');
  check(/03:00/.test(local ?? ''), `Visitante em Lisboa vê o horário local 03:00 (obtido: ${local})`);
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} verificação(ões) falharam` : '\nTodas as verificações passaram');
process.exit(failures ? 1 : 0);
