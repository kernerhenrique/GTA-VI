// Gera AVIF + WebP em vários tamanhos em public/assets/ e o manifest src/data/images.manifest.json.
// Uso: node scripts/optimize-images.mjs
import { readFile, readdir, mkdir, writeFile, access } from 'node:fs/promises';
const exists = (p) => access(p).then(() => true, () => false);
const force = process.argv.includes('--force');
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { images } = JSON.parse(await readFile(path.join(root, 'scripts/assets.sources.json'), 'utf8'));
const srcDir = path.join(root, 'assets-src');
const outDir = path.join(root, 'public/assets');
await mkdir(outDir, { recursive: true });

const files = await readdir(srcDir).catch(() => []);
const manifest = {};
const missing = [];

for (const img of images) {
  const file = files.find((f) => f.startsWith(img.key + '.') && !f.endsWith('.json'));
  if (!file) { missing.push(img.key); continue; }
  let pipeline = sharp(path.join(srcDir, file)).rotate();
  let meta = await pipeline.metadata();
  let w = meta.width, h = meta.height;
  if (img.crop) {
    const [cw, ch] = img.crop;
    const target = cw / ch;
    if (w / h > target) { const nw = Math.round(h * target); pipeline = pipeline.extract({ left: Math.round((w - nw) / 2), top: 0, width: nw, height: h }); w = nw; }
    else { const nh = Math.round(w / target); pipeline = pipeline.extract({ left: 0, top: Math.round((h - nh) / 2), width: w, height: nh }); h = nh; }
  }
  const base = await pipeline.toBuffer();
  const widths = [...new Set(img.widths.map((x) => Math.min(x, w)))].sort((a, b) => a - b);
  for (const width of widths) {
    const avif = path.join(outDir, `${img.key}-${width}.avif`);
    const webp = path.join(outDir, `${img.key}-${width}.webp`);
    if (!force && (await exists(avif)) && (await exists(webp))) continue; // use --force para regerar
    const resized = sharp(base).resize({ width, withoutEnlargement: true });
    await resized.clone().avif({ quality: 52, effort: 4 }).toFile(avif);
    await resized.clone().webp({ quality: 74 }).toFile(webp);
  }
  const blur = await sharp(base).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  const { dominant } = await sharp(base).stats();
  manifest[img.key] = {
    w, h, widths, alt: img.alt, credit: img.credit,
    blur: `data:image/webp;base64,${blur.toString('base64')}`,
    color: `rgb(${dominant.r},${dominant.g},${dominant.b})`,
  };
  process.stdout.write('.');
}
await writeFile(path.join(root, 'src/data/images.manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`\nOtimizadas: ${Object.keys(manifest).length} · sem arquivo (placeholder): ${missing.length}`);
if (missing.length) console.log('Sem arquivo:', missing.join(', '));
