import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pages, pagesFile, pageHref } from '../src/lib/data';
import { canonicalPath } from '../src/lib/seo';
import manifest from '../src/data/images.manifest.json';

const pagesDir = fileURLToPath(new URL('../src/pages/', import.meta.url));

describe('cadastro de páginas (src/data/pages.json)', () => {
  it('cada página cadastrada tem um arquivo em src/pages', () => {
    for (const p of pages) expect(existsSync(`${pagesDir}${p.slug}.astro`), `${p.slug}.astro`).toBe(true);
  });
  it('slugs são únicos', () => {
    const slugs = pages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('capas e cards usam imagens que existem no manifest', () => {
    for (const p of pages) {
      expect(manifest, p.image).toHaveProperty([p.image]);
      expect(manifest, p.cardImage).toHaveProperty([p.cardImage]);
    }
  });
  it('o menu do desktop só aponta para páginas cadastradas', () => {
    const slugs = new Set(pages.map((p) => p.slug));
    for (const s of [...pagesFile.header.game, ...pagesFile.header.primary, ...pagesFile.header.shortcuts]) expect(slugs.has(s), s).toBe(true);
  });
});

describe('caminhos', () => {
  it('pageHref', () => {
    expect(pageHref('')).toBe('/');
    expect(pageHref('comprar')).toBe('/comprar');
  });
  it('canonicalPath normaliza .html, index e barra final', () => {
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/comprar.html')).toBe('/comprar');
    expect(canonicalPath('/comprar/')).toBe('/comprar');
    expect(canonicalPath('/linha-do-tempo')).toBe('/linha-do-tempo');
  });
});
