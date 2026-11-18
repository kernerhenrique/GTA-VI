// Teste do contador em três momentos (antes, no exato T-0 e depois), com relógio simulado do Playwright.
// Uso: npm run preview (em outro terminal) && node scripts/e2e.mjs [baseUrl] [pastaScreenshots]
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:4321/';
const out = process.argv[3] || 'screenshots';
mkdirSync(out, { recursive: true });
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
  check((await page.textContent('.count-chip [data-mini-label]')) === 'Disponível', 'DEPOIS: contador do cabeçalho mostra "Disponível"');
  // navegação real pelo menu para outra página
  await page.click('.nav-list a.nav-link[href="/linha-do-tempo"]');
  await page.waitForURL('**/linha-do-tempo');
  await page.clock.runFor(3000); await page.waitForTimeout(1200);
  check(new URL(page.url()).pathname === '/linha-do-tempo', 'Menu → "Linha do tempo" abre a página /linha-do-tempo');
  check((await page.getAttribute('.nav-list a.nav-link[href="/linha-do-tempo"]', 'aria-current')) === 'page', 'Menu marca a página atual (aria-current)');
  check(await page.isVisible('[data-tl-here]'), 'Linha do tempo: marcador "você está aqui" visível');
  const future2 = await page.$$eval('[data-tl-item].is-future', (els) => els.map((e) => e.getAttribute('data-date')));
  check(future2.length === 1 && future2[0] === '2026-12-11', `DEPOIS: linha do tempo só tem 1 evento futuro (álbum do Justice): ${JSON.stringify(future2)}`);
  // miniatura de trailer na linha do tempo → página de trailers, no card certo
  const thumb = await page.$('a.tl-thumb[href^="/trailers#"]');
  const thumbHref = await thumb.getAttribute('href');
  await thumb.scrollIntoViewIfNeeded();
  await thumb.click();
  await page.waitForURL('**/trailers#*');
  await page.clock.runFor(1000); await page.waitForTimeout(900);
  const tid = thumbHref.split('#')[1];
  const topT = await page.evaluate((i) => document.getElementById(i).getBoundingClientRect().top, tid);
  check(topT > -80 && topT < 220, `Miniatura → ${thumbHref} cai no card certo (topo a ${Math.round(topT)}px)`);
  // FAQ pelo menu
  await page.click('.nav-list a.nav-link[href="/faq"]');
  await page.waitForURL('**/faq');
  check((await page.textContent('h1#page-title'))?.trim() === 'FAQ', 'Menu → "FAQ" abre a página /faq');
  // mega menu pelo teclado
  await page.focus('[data-mega-btn]');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  check(await page.isVisible('[data-mega]'), 'Mega menu "O Jogo" abre pelo teclado');
  check((await page.$$('[data-mega] a.mega-card')).length === 4, 'Mega menu mostra 4 páginas do jogo');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const megaClosed = !(await page.isVisible('[data-mega]'));
  const focusBack = await page.evaluate(() => document.activeElement?.hasAttribute('data-mega-btn'));
  check(megaClosed && focusBack, 'Esc fecha o mega menu e devolve o foco ao botão');
  check(errors.length === 0, `DEPOIS: sem erros de JS ${errors.join(' | ')}`);
  await page.screenshot({ path: `${out}/e2e-3-depois.png` });
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
// 5) Celular: menu em tela cheia e navegação entre páginas
{
  const ctx = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + 'comprar', { waitUntil: 'networkidle' });
  await page.click('[data-menu-btn]');
  await page.waitForTimeout(500);
  check(await page.isVisible('[data-mobile-menu]'), 'Celular: menu abre em tela cheia');
  check(await page.$eval('[data-mobile-menu]', (d) => d.open && d.matches(':modal')), 'Celular: menu é modal (foco preso e fundo inerte)');
  check((await page.getAttribute('[data-mobile-menu] .m-list a[href="/comprar"]', 'aria-current')) === 'page', 'Celular: página atual marcada no menu');
  check(await page.isVisible('[data-mobile-menu] a.m-support[href="/apoie"]'), 'Celular: "Apoie o site" em destaque no menu');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const closed = !(await page.$eval('[data-mobile-menu]', (d) => d.open));
  const focusBtn = await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-btn'));
  check(closed && focusBtn, 'Celular: Esc fecha o menu e devolve o foco ao botão');
  await page.click('[data-menu-btn]');
  await page.waitForTimeout(400);
  await page.click('[data-mobile-menu] .m-list a[href="/leonida"]');
  await page.waitForURL('**/leonida');
  check((await page.textContent('h1#page-title'))?.trim() === 'Só em Leonida', 'Celular: menu → Leonida abre a página /leonida');
  check(errors.length === 0, `Celular: sem erros de JS ${errors.join(' | ')}`);
  await ctx.close();
}
// 6) Apoio via Pix e links de afiliado
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle' });
  check(await page.$('.band-support a[href="/apoie"]') !== null, 'Home: faixa "Apoiar com Pix" leva a /apoie');
  await page.goto(base + 'apoie', { waitUntil: 'networkidle' });
  const key = await page.inputValue('[data-pix-input]');
  check(/^[0-9a-f-]{36}$/.test(key), `/apoie mostra a chave Pix aleatória (${key})`);
  await page.click('[data-pix-copy]');
  await page.waitForTimeout(300);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  check(copied === key, 'Botão "Copiar chave" copia a chave para a área de transferência');
  check(/copiada/i.test((await page.textContent('[data-pix-status]')) ?? ''), 'Confirmação "Chave copiada!" anunciada (aria-live)');
  check((await page.$$('.ap-roadmap > li')).length >= 3, '/apoie mostra a lista "O que vem por aí"');
  check(!(await page.isVisible('.ph-chapter .ph-of')), '/apoie fica fora da numeração de capítulos');
  await page.goto(base + 'comprar', { waitUntil: 'networkidle' });
  const links = await page.$$eval('#comprar-amazon a.am-card', (as) => as.map((a) => ({ href: a.href, rel: a.rel })));
  check(links.length >= 4 && links.every((l) => l.href.startsWith('https://www.amazon.com.br/s?') && /sponsored/.test(l.rel)), `/comprar: ${links.length} links da Amazon com rel="sponsored"`);
  check(/associado da Amazon/i.test((await page.textContent('#comprar-amazon')) ?? ''), '/comprar: aviso obrigatório de afiliado visível');
  check(await page.$('.band-support.is-compact a[href="/apoie"]') !== null, 'Páginas internas: faixa compacta de apoio antes do "anterior / próxima"');
  check(errors.length === 0, `Apoio/afiliados: sem erros de JS ${errors.join(' | ')}`);
  await ctx.close();
}
await browser.close();
console.log(failures ? `\n${failures} verificação(ões) falharam` : '\nTodas as verificações passaram');
process.exit(failures ? 1 : 0);
