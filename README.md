# Leonida BR — fan site de GTA VI (pt-BR)

Fan site **não oficial** sobre Grand Theft Auto VI. Ele traz a contagem regressiva para o lançamento (19/11/2026, 0h de Brasília), as edições e os preços em R$, personagens, o estado de Leonida, trailers, uma linha do tempo animada, a recepção da crítica, um FAQ e as fontes de tudo. O site funciona **antes, no momento e depois** do lançamento: o hub muda sozinho de estado.

> Sem afiliação com a Rockstar Games ou a Take-Two Interactive. Imagens, vídeos e marcas © Rockstar Games, usados com crédito.

- **Stack:** Astro 5 (site estático), TypeScript, Tailwind CSS 4, GSAP/ScrollTrigger (carregado sob demanda) e Zod (validação dos dados).
- **Por que Astro:** o site é estático e pesado em mídia, com poucas partes interativas. Ele sai sem JavaScript por padrão, e as "ilhas" são TS puro. Assim não existe erro de hidratação, e o Lighthouse mobile fica acima de 90.

---

## Como rodar

Requer Node 22+.

```bash
npm install
```

```bash
npm run dev
```

Gerar o site de produção (roda `astro check` antes do build):

```bash
SITE_URL=https://seu-dominio.com.br npm run build
```

Servir o build localmente:

```bash
npm run preview
```

- O resultado estático fica em `dist/`. Hospede em qualquer serviço estático, como Netlify, Vercel, Cloudflare Pages ou GitHub Pages.
- **`SITE_URL`** define as URLs absolutas de canonical, Open Graph e JSON-LD. Sem ele, o build usa um domínio de exemplo.

## Como atualizar o conteúdo (semana do lançamento)

Todo o conteúdo fica em **`src/data/*.json`**, separado do layout.

- **Validação:** cada dado tem `status` (`confirmado`, `reportado` ou `rumor`), que aparece como selo no site, e `sources` (ids de `src/data/sources.json`).
- **Erro de digitação:** se você errar um campo ou citar uma fonte que não existe, **o build falha com uma mensagem dizendo o arquivo e o campo**.

| Quero… | Edite | Como |
|---|---|---|
| Mudar data, hora ou fuso do lançamento | `launch.json` | `releaseISO` (sempre com fuso, ex.: `2026-11-19T00:00:00-03:00`). É o **arquivo único** do contador. |
| Pôr as notas da crítica | `reviews.json` | Em `aggregates`, preencha `score` e `count`, e troque `url` do OpenCritic pela página do jogo. As notas aparecem no hub e em Recepção. |
| Adicionar trechos de reviews | `reviews.json` → `quotes` | `{ "outlet": "IGN Brasil", "score": "9/10", "text": "uma frase curta", "url": "https://…" }`. O build recusa textos com mais de 220 caracteres. |
| Prós e contras | `reviews.json` → `pros` / `cons` | Lista de frases curtas. |
| Confirmar ou desmentir o embargo | `reviews.json` → `embargo` e `status.json` → item `embargo` | Mude `text`, `status` e `sources`. |
| Manchete nova na faixa de notícias | `news.json` | Adicione no topo: `{ "date": "2026-11-19", "text": "…", "status": "confirmado", "sources": ["…"] }`. |
| Painel de status do hub | `status.json` | `value`, `detail`, `state` (`ok`, `pending`, `warn` ou `live`). Atualize também `updatedAt`. |
| Evento novo na linha do tempo | `timeline.json` | Inclua na ordem cronológica. Eventos futuros viram "EM BREVE" e passam a "passado" sozinhos quando a data chega. Para destacar um número, use `count`. |
| Preços | `editions.json` | `priceBRL` e `priceUSD` de cada edição, e `upgrade.priceBRL`. |
| Nova fonte | `sources.json` | `{ "id": "minha-fonte", "type": "oficial / imprensa / comunidade / avaliacao", "publisher": "…", "title": "…", "url": "…" }`. Depois é só citar o `id`. A seção **Fontes** é gerada sozinha, só com as fontes usadas. |
| FAQ | `faq.json` | Pergunta, resposta, selo e fontes. O JSON-LD `FAQPage` é gerado automaticamente. |

Depois de editar, rode `npm run build` e publique o `dist/`. A contagem, a troca de estado e a linha do tempo "você está aqui" rodam no navegador e não precisam de rebuild para virar no horário.

## Testar datas (antes, no momento e depois)

Abra o site com `?agora=` e uma data ISO. Aparece uma faixa "MODO SIMULAÇÃO", e o relógio continua andando a partir dessa data.

- `http://localhost:4321/?agora=2026-11-18T23:59:50-03:00` mostra a virada do painel para LIBERADO e a transição.
- `http://localhost:4321/?agora=2026-11-25T12:00:00-03:00` mostra o estado DISPONÍVEL AGORA, com o tempo desde o lançamento.

O hub tem a opção **"Contar até: 0h de Brasília / meia-noite no meu fuso"**. A regra oficial da Rockstar é a liberação à meia-noite local em cada região.

## Verificações

| Comando | O que faz |
|---|---|
| `npm test` | Vitest da lógica do lançamento (antes, T-0 e depois) e do "você está aqui" da linha do tempo |
| `npm run e2e` | Playwright com relógio simulado: antes, T-0 com animação, depois, `?agora=`, visitante em Lisboa e navegação pelo menu (precisa do `npm run preview` rodando) |
| `npm run screenshots` | Capturas por seção em desktop e iPhone na pasta `screenshots/` |
| `npm run report:data` | Gera `research/DATA-REPORT.md` com cada dado, o selo e as fontes, e lista o que não é oficial |
| `npm run check:links` | Âncoras internas, arquivos locais e links externos do build |
| `npm run check` | `astro check` (TypeScript) |

## Imagens e vídeos

Detalhes completos em **[ASSETS.md](ASSETS.md)**.

- **Download e otimização:** `npm run assets` baixa as imagens oficiais (lista em `scripts/assets.sources.json`) e gera AVIF e WebP em vários tamanhos em `public/assets/`.
- **Imagem que falta:** vira placeholder na proporção certa, e nada quebra.
- **Pendente — vídeos curtos:** 8 clipes de 3 a 8 s para `public/clips/`. O `ASSETS.md` lista quais são, onde entram e os comandos ffmpeg. Enquanto não existirem, aparece a imagem de fallback.
- **Pendente — mapa oficial de Leonida:** a Rockstar libera o mapa para download em 19/11. O mapa do site é esquemático e feito por fãs, e está marcado como não oficial.
- **Open Graph:** `node scripts/make-og.mjs` regera `public/og.jpg`.

## Estrutura

```
research/            RESEARCH.md (pesquisa com fontes), VISUAL.md (paleta oficial), DATA-REPORT.md
src/data/            todo o conteúdo (JSON) + images.manifest.json (gerado)
src/lib/             data.ts (validação Zod), launch-state.ts (lógica pura do lançamento), time.ts
src/components/      sections/ (uma por seção), hub/ (split-flap), ui/ (Picture, Badge, LoopClip…), layout/
src/scripts/         relógio compartilhado, efeitos (scramble, count up), timeline (GSAP), terrain, halftone
scripts/             assets, imagens, OG, e2e, screenshots, relatório de dados, links
public/assets/       imagens otimizadas · public/clips/ vídeos curtos (pendentes)
```
