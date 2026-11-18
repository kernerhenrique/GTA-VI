// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Endereço público do site (canonical, Open Graph, JSON-LD e sitemap):
// 1) SITE_URL, se definido (ex.: SITE_URL=https://seusite.com.br npm run build);
// 2) na Vercel, o domínio de produção do projeto (variável de sistema VERCEL_PROJECT_PRODUCTION_URL);
// 3) senão, um domínio de exemplo.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL || (vercelHost ? `https://${vercelHost}` : 'https://gta6-fan-br.example');

export default defineConfig({
  site,
  // URLs sem barra no fim (/comprar): o build gera comprar.html e a Vercel serve com cleanUrls
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  compressHTML: true,
  // pré-carrega a página ao passar o mouse/focar nos links marcados com data-astro-prefetch
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    // cast: o plugin do Tailwind é tipado com uma versão mais nova do Vite que a do Astro 5
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
