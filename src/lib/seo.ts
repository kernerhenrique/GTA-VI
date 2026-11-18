/** JSON-LD (schema.org) gerado a partir dos dados. */
import { launch, story, editions, trailers, ratings } from './data';

/** Caminho canônico: sem `.html`, sem `index` e sem barra no fim (o build usa `build.format: 'file'`). */
export function canonicalPath(pathname: string) {
  const p = pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

export function videoGameJsonLd(site: URL) {
  const url = new URL('/', site).href;
  const launchTrailer = trailers.items.find((t) => t.id === 'launch');
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: launch.gameTitle,
    alternateName: ['GTA VI', 'GTA 6'],
    description: story.synopsis,
    url,
    sameAs: ['https://www.rockstargames.com/VI'],
    image: new URL('/og.jpg', site).href,
    datePublished: '2026-11-19',
    gamePlatform: launch.platforms,
    applicationCategory: 'Game',
    genre: ['Ação', 'Aventura', 'Mundo aberto'],
    playMode: 'SinglePlayer',
    publisher: { '@type': 'Organization', name: 'Rockstar Games', url: 'https://www.rockstargames.com' },
    author: { '@type': 'Organization', name: 'Rockstar Games' },
    contentRating: `ClassInd ${ratings.ratings.find((r) => r.id === 'classind')?.rating ?? '18'}`,
    offers: editions.editions.map((e) => ({
      '@type': 'Offer',
      name: e.name,
      price: e.priceBRL.toFixed(2),
      priceCurrency: 'BRL',
      url: 'https://store.playstation.com/pt-br/concept/10000730',
      seller: { '@type': 'Organization', name: 'PlayStation Store Brasil' },
    })),
    trailer: launchTrailer && {
      '@type': 'VideoObject',
      name: `Grand Theft Auto VI — ${launchTrailer.title}`,
      description: launchTrailer.description,
      uploadDate: launchTrailer.date,
      thumbnailUrl: `https://i.ytimg.com/vi/${launchTrailer.youtubeId}/maxresdefault.jpg`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${launchTrailer.youtubeId}`,
    },
  };
}

export function breadcrumbJsonLd(site: URL, trail: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: new URL(t.path, site).href })),
  };
}
