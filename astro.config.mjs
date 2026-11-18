// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Endereço público do site (canonical, Open Graph, JSON-LD e sitemap).
// SITE_URL substitui o padrão (ex.: quando houver domínio próprio: SITE_URL=https://seusite.com.br npm run build).
export const PRODUCTION_URL = 'https://gta-vi.leonidabr.workers.dev';
const site = process.env.SITE_URL || PRODUCTION_URL;

export default defineConfig({
  site,
  // URLs sem barra no fim (/comprar): o build gera comprar.html e a Cloudflare Pages serve sem o .html
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
