/**
 * Carrega e VALIDA todos os arquivos de src/data/*.json no build.
 * Se algum dado estiver com formato errado, ou citar uma fonte que não existe em sources.json,
 * o build falha com uma mensagem clara (ex.: "editions.json → items[3].sources: fonte 'xyz' não existe").
 */
import { z } from 'zod';

import sourcesRaw from '../data/sources.json';
import launchRaw from '../data/launch.json';
import statusRaw from '../data/status.json';
import newsRaw from '../data/news.json';
import editionsRaw from '../data/editions.json';
import platformsRaw from '../data/platforms.json';
import ratingsRaw from '../data/ratings.json';
import storyRaw from '../data/story.json';
import charactersRaw from '../data/characters.json';
import regionsRaw from '../data/regions.json';
import gameplayRaw from '../data/gameplay.json';
import techRaw from '../data/tech.json';
import musicRaw from '../data/music.json';
import onlineRaw from '../data/online.json';
import trailersRaw from '../data/trailers.json';
import timelineRaw from '../data/timeline.json';
import reviewsRaw from '../data/reviews.json';
import communityRaw from '../data/community.json';
import triviaRaw from '../data/trivia.json';
import comparisonsRaw from '../data/comparisons.json';
import faqRaw from '../data/faq.json';
import pagesRaw from '../data/pages.json';
import supportRaw from '../data/support.json';
import affiliateRaw from '../data/affiliate.json';
import imageManifest from '../data/images.manifest.json';

export const Status = z.enum(['confirmado', 'reportado', 'rumor']);
export type StatusT = z.infer<typeof Status>;

const Sourced = { status: Status, sources: z.array(z.string()).min(1) };
const OptSourced = { status: Status.optional(), sources: z.array(z.string()).optional() };

const SourceSchema = z.object({
  id: z.string(),
  type: z.enum(['oficial', 'imprensa', 'comunidade', 'avaliacao']),
  publisher: z.string(),
  title: z.string(),
  url: z.string().url(),
  accessedAt: z.string().optional(),
});
const SourcesFile = z.object({ accessedAtDefault: z.string(), sources: z.array(SourceSchema) });

const LaunchFile = z.object({
  gameTitle: z.string(),
  releaseISO: z.string().refine((s) => Number.isFinite(Date.parse(s)) && /[+-]\d{2}:\d{2}$|Z$/.test(s), 'releaseISO precisa ser ISO com fuso (ex.: 2026-11-19T00:00:00-03:00)'),
  releaseTimeZone: z.string(),
  releaseTimeZoneLabel: z.string(),
  localMidnightDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  unlockRule: z.string(),
  launchAnimationSeconds: z.number().min(1).max(120),
  platforms: z.array(z.string()),
  cloud: z.object({ label: z.string(), iso: z.string(), note: z.string(), ...Sourced }),
  preload: z.object({ startISO: z.string(), sizeGB: z.number(), note: z.string(), ...Sourced }),
  stores: z.array(z.object({ id: z.string(), label: z.string(), url: z.string().url() })),
  officialDownloads: z.object({ label: z.string(), url: z.string().url(), ...Sourced }),
  ...Sourced,
});

const StatusFile = z.object({
  updatedAt: z.string(),
  items: z.array(z.object({ id: z.string(), label: z.string(), value: z.string(), detail: z.string(), state: z.enum(['ok', 'pending', 'warn', 'live']), ...Sourced })),
});

const NewsFile = z.object({ items: z.array(z.object({ date: z.string(), text: z.string(), ...Sourced })) });

const EditionItem = z.object({ id: z.string(), name: z.string(), category: z.string(), description: z.string(), image: z.string(), gallery: z.array(z.string()).optional(), ...Sourced });
const EditionsFile = z.object({
  updatedAt: z.string(),
  editions: z.array(z.object({
    id: z.string(), name: z.string(), tagline: z.string(), format: z.string(),
    priceBRL: z.number(), priceUSD: z.number(), image: z.string(), includes: z.array(z.string()),
    highlight: z.boolean(), officialBlurb: z.string().optional(), ...Sourced,
  })),
  upgrade: z.object({ name: z.string(), priceBRL: z.number(), note: z.string(), ...Sourced }),
  physical: z.object({ text: z.string(), retailNote: z.string(), status: Status, retailStatus: Status, sources: z.array(z.string()), retailSources: z.array(z.string()) }),
  items: z.array(EditionItem),
  collectorsBox: z.object({
    name: z.string(), kind: z.string(), priceUSD: z.number(), priceStatus: Status, priceSources: z.array(z.string()),
    releaseDate: z.string(), image: z.string(),
    contents: z.array(z.object({ name: z.string(), detail: z.string(), image: z.string() })),
    ...Sourced,
  }),
});

const PlatformsFile = z.object({
  items: z.array(z.object({
    id: z.string(), name: z.string(), availability: z.enum(['sim', 'nuvem', 'nao-anunciado', 'nao']), label: z.string(),
    features: z.array(z.string()), rumor: z.object({ text: z.string(), ...Sourced }).optional(), ...Sourced,
  })),
});

const RatingsFile = z.object({
  ratings: z.array(z.object({ id: z.string(), system: z.string(), rating: z.string(), label: z.string(), descriptors: z.array(z.string()), note: z.string().optional(), ...Sourced })),
  languages: z.object({ summary: z.string(), text: z.array(z.string()), audio: z.array(z.string()), note: z.string(), ...Sourced }),
  storage: z.object({ value: z.string(), note: z.string(), ...Sourced }),
  monetization: z.object({ text: z.string(), ...Sourced }),
});

const StoryFile = z.object({
  tagline: z.string(), synopsis: z.string(), synopsisNote: z.string(), synopsisStatus: Status, synopsisSources: z.array(z.string()),
  quote: z.object({ text: z.string(), original: z.string(), ...Sourced }),
  themes: z.array(z.object({ title: z.string(), text: z.string(), ...Sourced })),
  tone: z.string(),
});

const CharactersFile = z.object({
  items: z.array(z.object({
    id: z.string(), name: z.string(), role: z.string(), tagline: z.string(), bio: z.string(),
    quotes: z.array(z.string()), quotesOriginal: z.array(z.string()), images: z.array(z.string()).min(1),
    accent: z.string(), voice: z.object({ text: z.string(), ...Sourced }).optional(), ...Sourced,
  })),
  relations: z.array(z.object({ from: z.string(), to: z.string(), label: z.string(), ...Sourced })),
  relationsNote: z.string().optional(),
});

const RegionsFile = z.object({
  mapNote: z.string(),
  size: z.object({ text: z.string(), conflict: z.string(), conflictSources: z.array(z.string()), ...Sourced }),
  items: z.array(z.object({
    id: z.string(), name: z.string(), tagline: z.string(), description: z.string(), highlights: z.array(z.string()),
    inspiration: z.string(), postcard: z.string(), image: z.string(),
    map: z.object({ x: z.number(), y: z.number(), path: z.string() }),
    inspirationStatus: Status, inspirationSources: z.array(z.string()), ...Sourced,
  })),
});

const GameplayFile = z.object({ items: z.array(z.object({ id: z.string(), title: z.string(), icon: z.string(), text: z.string(), ...Sourced })) });

const Note = z.object({ text: z.string(), ...Sourced });
const TechFile = z.object({
  rows: z.array(z.object({ platform: z.string(), fps: z.string(), resolution: z.string(), rt: z.string(), extras: z.string(), notes: z.array(Note).optional(), ...Sourced })),
  statement: Note,
});

const MusicFile = z.object({
  intro: Note,
  stations: z.array(z.object({ id: z.string(), name: z.string(), genre: z.string(), hosts: z.string(), text: z.string(), image: z.string(), ...Sourced })),
  hostsNote: Note,
  album: z.object({ name: z.string(), date: z.string(), text: z.string(), image: z.string(), singles: z.array(z.string()), ...Sourced }),
  score: z.object({ name: z.string(), date: z.string(), text: z.string(), image: z.string(), singles: z.array(z.string()), ...Sourced }),
  festival: z.object({ name: z.string(), date: z.string(), place: z.string(), text: z.string(), ...Sourced }),
});

const OnlineFile = z.object({ items: z.array(z.object({ title: z.string(), text: z.string(), ...Sourced })) });

const RecordSchema = z.object({ label: z.string(), value: z.number(), display: z.string(), ...Sourced });
const TrailersFile = z.object({
  items: z.array(z.object({
    id: z.string(), title: z.string(), youtubeId: z.string().regex(/^[\w-]{11}$/), date: z.string(), duration: z.string(),
    description: z.string(), thumb: z.string(), records: z.array(RecordSchema), dateNote: z.string().optional(), ...Sourced,
  })),
});

const TimelineType = z.enum(['anuncio', 'trailer', 'adiamento', 'vazamento', 'venda', 'musica', 'lancamento', 'evento', 'tecnico', 'review']);
const TimelineFile = z.object({
  events: z.array(z.object({
    id: z.string(), date: z.string().refine((s) => Number.isFinite(Date.parse(s)), 'data inválida'), dateLabel: z.string().optional(),
    type: TimelineType, title: z.string(), text: z.string(), image: z.string().optional(), trailerId: z.string().optional(),
    count: RecordSchema.optional(), oldDate: z.string().optional(), newDate: z.string().optional(), isLaunch: z.boolean().optional(),
    ...Sourced,
  })),
});

const ReviewsFile = z.object({
  updatedAt: z.string(),
  embargo: Note,
  aggregates: z.array(z.object({ id: z.string(), name: z.string(), score: z.number().nullable(), max: z.number(), count: z.number().nullable(), url: z.string().url(), note: z.string(), ...Sourced })),
  benchmarks: z.array(z.object({ game: z.string(), score: z.number(), label: z.string() })),
  benchmarksStatus: Status,
  benchmarksSources: z.array(z.string()),
  quotes: z.array(z.object({ outlet: z.string(), score: z.string().optional(), text: z.string().max(220, 'citação longa demais: use no máximo uma frase curta'), url: z.string().url(), ...OptSourced })),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
});

const CommunityFile = z.object({
  items: z.array(z.object({ id: z.string(), title: z.string(), text: z.string(), stat: z.object({ value: z.number(), display: z.string(), label: z.string() }).optional(), ...Sourced })),
});
const TriviaFile = z.object({ items: z.array(z.object({ title: z.string(), text: z.string(), ...Sourced })) });
const ComparisonsFile = z.object({
  beforeAfter: z.object({ title: z.string(), before: z.object({ image: z.string(), label: z.string() }), after: z.object({ image: z.string(), label: z.string() }), note: z.string(), ...Sourced }),
  table: z.object({ columns: z.array(z.string()), rows: z.array(z.object({ label: z.string(), values: z.array(z.string()), ...Sourced })) }),
});
const FaqFile = z.object({ items: z.array(z.object({ q: z.string(), a: z.string(), ...Sourced })) });

const SupportFile = z.object({
  pix: z.object({
    key: z.string(),
    keyType: z.string(),
    name: z.string().max(25, 'nome do Pix: no máximo 25 caracteres'),
    city: z.string().max(15, 'cidade do Pix: no máximo 15 caracteres'),
  }),
  headline: z.string(),
  pitch: z.string(),
  bandText: z.string(),
  roadmap: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string() })).min(1),
  promises: z.array(z.string()),
  updates: z.array(z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), text: z.string() })),
});
const AffiliateFile = z.object({
  amazonTag: z.string().regex(/^([a-z0-9-]+-2\d)?$/, "tag da Amazon no formato 'seunome-20' (ou vazia)"),
  disclosure: z.string().min(10),
  disclosureSource: z.string().url(),
  intro: z.string(),
  items: z.array(z.object({ id: z.string(), icon: z.string(), title: z.string(), text: z.string(), query: z.string() })).min(1),
});

const imageKeys = new Set(Object.keys(imageManifest));
const ImageKey = z.string().refine((k) => imageKeys.has(k), (k) => ({ message: `imagem '${k}' não existe em images.manifest.json` }));
const PageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug só com letras minúsculas, números e hífen'),
  label: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  seoTitle: z.string().max(80),
  description: z.string().max(240),
  lead: z.string(),
  image: ImageKey,
  imagePosition: z.string().optional(),
  cardImage: ImageKey,
  cardPosition: z.string().optional(),
  sections: z.array(z.object({ id: z.string(), label: z.string() })).optional(),
  /** false = fora da numeração de capítulos, do 'anterior / próxima' e do mosaico da home */
  sequence: z.boolean().optional(),
});
const PagesFile = z
  .object({
    header: z.object({ game: z.array(z.string()), primary: z.array(z.string()), shortcuts: z.array(z.string()) }),
    pages: z.array(PageSchema).min(1),
  })
  .superRefine((f, ctx) => {
    const slugs = new Set<string>();
    f.pages.forEach((p, i) => {
      if (slugs.has(p.slug)) ctx.addIssue({ code: 'custom', path: ['pages', i, 'slug'], message: `slug repetido: '${p.slug}'` });
      slugs.add(p.slug);
    });
    (['game', 'primary', 'shortcuts'] as const).forEach((k) =>
      f.header[k].forEach((s, i) => {
        if (!slugs.has(s)) ctx.addIssue({ code: 'custom', path: ['header', k, i], message: `página '${s}' não existe em pages` });
      }),
    );
  });

function parse<T extends z.ZodTypeAny>(name: string, schema: T, raw: unknown): z.infer<T> {
  const r = schema.safeParse(raw);
  if (!r.success) {
    const msg = r.error.issues.map((i) => `  • ${name} → ${i.path.join('.') || '(raiz)'}: ${i.message}`).join('\n');
    throw new Error(`\n[dados] Erro de validação em src/data/${name}:\n${msg}\n`);
  }
  return r.data;
}

export const sourcesFile = parse('sources.json', SourcesFile, sourcesRaw);
export const launch = parse('launch.json', LaunchFile, launchRaw);
export const status = parse('status.json', StatusFile, statusRaw);
export const news = parse('news.json', NewsFile, newsRaw);
export const editions = parse('editions.json', EditionsFile, editionsRaw);
export const platforms = parse('platforms.json', PlatformsFile, platformsRaw);
export const ratings = parse('ratings.json', RatingsFile, ratingsRaw);
export const story = parse('story.json', StoryFile, storyRaw);
export const characters = parse('characters.json', CharactersFile, charactersRaw);
export const regions = parse('regions.json', RegionsFile, regionsRaw);
export const gameplay = parse('gameplay.json', GameplayFile, gameplayRaw);
export const tech = parse('tech.json', TechFile, techRaw);
export const music = parse('music.json', MusicFile, musicRaw);
export const online = parse('online.json', OnlineFile, onlineRaw);
export const trailers = parse('trailers.json', TrailersFile, trailersRaw);
export const timeline = parse('timeline.json', TimelineFile, timelineRaw);
export const reviews = parse('reviews.json', ReviewsFile, reviewsRaw);
export const community = parse('community.json', CommunityFile, communityRaw);
export const trivia = parse('trivia.json', TriviaFile, triviaRaw);
export const comparisons = parse('comparisons.json', ComparisonsFile, comparisonsRaw);
export const faq = parse('faq.json', FaqFile, faqRaw);
export const pagesFile = parse('pages.json', PagesFile, pagesRaw);
export type PageInfo = z.infer<typeof PageSchema>;
export const pages = pagesFile.pages;
export const pageBySlug = (slug: string): PageInfo => {
  const p = pages.find((x) => x.slug === slug);
  if (!p) throw new Error(`[páginas] '${slug}' não existe em src/data/pages.json`);
  return p;
};
/** Caminho da página: '/' para a home, '/slug' para as demais. */
export const pageHref = (slug: string) => (slug ? `/${slug}` : '/');
/** Páginas na ordem de leitura (capítulos numerados, "anterior / próxima", mosaico da home). */
export const chapters = pages.filter((p) => p.sequence !== false);

export const support = parse('support.json', SupportFile, supportRaw);
export const affiliate = parse('affiliate.json', AffiliateFile, affiliateRaw);
/** Link de busca da Amazon Brasil com a tag de afiliado (sem tag, o link funciona mas não rende comissão). */
export function amazonUrl(query: string, tag: string = affiliate.amazonTag) {
  const u = new URL('https://www.amazon.com.br/s');
  u.searchParams.set('k', query);
  if (tag) u.searchParams.set('tag', tag);
  return u.href;
}

export type Source = z.infer<typeof SourceSchema>;
export const sourceMap = new Map<string, Source>(sourcesFile.sources.map((s) => [s.id, s]));

/** Verifica que todo id em qualquer campo *sources/*Sources existe em sources.json. */
function checkSourceRefs(name: string, node: unknown, path: string[] = []): string[] {
  const errs: string[] = [];
  if (Array.isArray(node)) {
    node.forEach((v, i) => errs.push(...checkSourceRefs(name, v, [...path, String(i)])));
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (/sources$/i.test(k) && Array.isArray(v)) {
        v.forEach((id) => {
          if (!sourceMap.has(String(id))) errs.push(`  • ${name} → ${[...path, k].join('.')}: fonte '${id}' não existe em sources.json`);
        });
      } else errs.push(...checkSourceRefs(name, v, [...path, k]));
    }
  }
  return errs;
}

const allFiles: Record<string, unknown> = {
  'launch.json': launch, 'status.json': status, 'news.json': news, 'editions.json': editions, 'platforms.json': platforms,
  'ratings.json': ratings, 'story.json': story, 'characters.json': characters, 'regions.json': regions, 'gameplay.json': gameplay,
  'tech.json': tech, 'music.json': music, 'online.json': online, 'trailers.json': trailers, 'timeline.json': timeline,
  'reviews.json': reviews, 'community.json': community, 'trivia.json': trivia, 'comparisons.json': comparisons, 'faq.json': faq,
};
const refErrors = Object.entries(allFiles).flatMap(([n, d]) => checkSourceRefs(n, d));
if (refErrors.length) throw new Error(`\n[dados] Referências de fonte inválidas:\n${refErrors.join('\n')}\n`);

/** Ids de fontes efetivamente citadas no site (para a seção Fontes). */
export function usedSourceIds(): Set<string> {
  const used = new Set<string>();
  const walk = (node: unknown) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        if (/sources$/i.test(k) && Array.isArray(v)) v.forEach((id) => used.add(String(id)));
        else walk(v);
      }
    }
  };
  Object.values(allFiles).forEach(walk);
  return used;
}

export function getSources(ids: string[] | undefined): Source[] {
  return (ids ?? []).map((id) => sourceMap.get(id)).filter((s): s is Source => !!s);
}
