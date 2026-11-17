// Baixa as imagens oficiais listadas em scripts/assets.sources.json para assets-src/ (originais, fora do git).
// Uso: node scripts/fetch-assets.mjs   (rode de novo quando adicionar imagens; só baixa o que falta)
import { readFile, mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { images } = JSON.parse(await readFile(path.join(root, 'scripts/assets.sources.json'), 'utf8'));
const outDir = path.join(root, 'assets-src');
await mkdir(outDir, { recursive: true });

const exists = (p) => access(p).then(() => true, () => false);
let ok = 0, skipped = 0;
const failed = [];

for (const img of images) {
  const ext = (img.url.match(/\.(jpe?g|png|webp)(?:[?#]|$)/i)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
  const file = path.join(outDir, `${img.key}.${ext}`);
  if (await exists(file)) { skipped++; continue; }
  let url = img.url;
  // O CDN do site oficial redimensiona sob demanda; pedimos no máximo 2560px para economizar banda.
  if (url.includes('rockstargames.com/VI/_next/static/media')) {
    const max = Math.min(2560, Math.max(...img.widths) * 1.25);
    url += `?akim=1&imdensity=1&imwidth=${Math.round(max)}`;
  }
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (fan-site asset fetcher)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    ok++;
    process.stdout.write('.');
  } catch (e) {
    failed.push({ key: img.key, url: img.url, error: String(e.message || e) });
  }
}
console.log(`\nBaixadas: ${ok} · já existiam: ${skipped} · falharam: ${failed.length}`);
if (failed.length) {
  console.log('Falhas (ficam como placeholder no site — anote em ASSETS.md):');
  for (const f of failed) console.log(` - ${f.key}: ${f.error} (${f.url})`);
  await writeFile(path.join(outDir, '_failed.json'), JSON.stringify(failed, null, 2));
}
