// Gera public/og.jpg (1200×630) a partir da arte oficial + tipografia do site, usando o Playwright.
// Uso: node scripts/make-og.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// tudo embutido como data: URI (setContent não carrega arquivos file://)
const f = (p, mime) => `data:${mime};base64,${readFileSync(path.join(root, p)).toString('base64')}`;
const fontDisplay = f('node_modules/@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2', 'font/woff2');
const fontMono = f('node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2', 'font/woff2');
const img = f('public/assets/og-source-1200.webp', 'image/webp');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;src:url(${fontDisplay}) format('woff2');font-weight:100 900}
@font-face{font-family:M;src:url(${fontMono}) format('woff2');font-weight:100 900}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#0C0D1B}
.bg{position:absolute;inset:0;background:url(${img}) 70% 30%/cover}
.s{position:absolute;inset:0;background:linear-gradient(90deg,rgba(12,13,27,.92) 0%,rgba(12,13,27,.55) 48%,rgba(12,13,27,0) 75%)}
.t{position:absolute;left:64px;top:70px;font-family:D;font-weight:900;text-transform:uppercase;line-height:.84;font-size:150px;color:#FFF9CB}
.t span{display:block}
.t .o{color:transparent;-webkit-text-stroke:3px #FEC9D8}
.t .g{background:linear-gradient(0deg,#FEC497 10%,#E9639B 100%);-webkit-background-clip:text;color:transparent}
.d{position:absolute;left:66px;bottom:66px;font-family:M;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#FFF9CB;font-size:24px}
.d b{color:#E9639B}
.k{position:absolute;right:20px;bottom:16px;font-family:M;font-size:14px;color:rgba(226,226,228,.85);background:rgba(12,13,27,.75);padding:6px 10px;border-radius:8px}
</style></head><body><div class="bg"></div><div class="s"></div>
<div class="t"><span>GTA VI</span><span class="o">19.11.2026</span><span class="g">Leonida BR</span></div>
<div class="d"><b>●</b> Contagem · edições em R$ · Leonida · trailers</div>
<div class="k">Fan site não oficial · arte © Rockstar Games</div></body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.setContent(html, { waitUntil: 'load' });
await p.waitForTimeout(400);
await p.screenshot({ path: path.join(root, 'public/og.jpg'), type: 'jpeg', quality: 86 });
await b.close();
console.log('public/og.jpg gerado');
