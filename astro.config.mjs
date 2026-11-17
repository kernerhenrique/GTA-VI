// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Defina SITE_URL no deploy (ex.: SITE_URL=https://seusite.com.br npm run build)
// para que Open Graph, canonical e JSON-LD usem URLs absolutas corretas.
const site = process.env.SITE_URL || 'https://gta6-fan-br.example';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: false,
  vite: {
    // cast: o plugin do Tailwind é tipado com uma versão mais nova do Vite que a do Astro 5
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
