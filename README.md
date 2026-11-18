# Leonida BR — fan site de GTA VI (pt-BR)

Fan site **não oficial** sobre Grand Theft Auto VI. Ele traz a contagem regressiva para o lançamento (19/11/2026, 0h de Brasília), as edições e os preços em R$, personagens, o estado de Leonida, trailers, uma linha do tempo animada, a recepção da crítica, um FAQ e as fontes de tudo, em **11 páginas**. O site funciona **antes, no momento e depois** do lançamento: o hub muda sozinho de estado.

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

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Capa com o Kinetic Type, hub de lançamento (split-flap e estado "disponível agora"), manchetes e o mosaico "Explore" |
| `/comprar` | Edições, preços, plataformas, classificação, idiomas e espaço |
| `/historia` | História e personagens |
| `/leonida` | Mapa interativo e regiões |
| `/jogabilidade` | Jogabilidade, parte técnica, rádios e online |
| `/trailers` | Trailers |
| `/linha-do-tempo` | Linha do tempo animada |
| `/recepcao` | Notas, reviews e comunidade |
| `/extras` | Vice City 2002 x 2026, GTA V x VI e curiosidades |
| `/faq` | Perguntas frequentes |
| `/fontes` | Todas as fontes |

- **Cadastro:** título de SEO, descrição, capa, ordem e o que aparece no menu vêm de `src/data/pages.json`. Para mudar o texto de uma capa ou a ordem de leitura, edite esse arquivo.
- **Página nova:** crie `src/pages/<slug>.astro` com o layout `Page` e cadastre o slug em `pages.json`. O menu do celular, o rodapé, a home, o "anterior / próxima" e o `sitemap.xml` se atualizam sozinhos; para aparecer na barra do desktop, inclua o slug em `header`.
- **Menu do desktop:** em `pages.json → header`, `game` são os cards do painel "O Jogo", `primary` os links da barra e `shortcuts` os atalhos do painel.

## Publicação na Vercel

O projeto da Vercel está ligado a este repositório. **Cada push na branch de produção publica o site sozinho**, sem nenhum passo manual.

- **Configuração:** está em `vercel.json` (Astro, `npm run build`, pasta `dist`, URLs sem `.html` e cache das imagens). Não precisa mexer no painel.
- **Logs:** se um deploy falhar, o motivo aparece em vercel.com → projeto → **Deployments** → clique no deploy → **Build Logs**. O build roda o `astro check`, então um JSON com erro também derruba o deploy, com a mensagem dizendo o arquivo e o campo.
- **Endereço do site:** na Vercel, o canonical, o Open Graph e o sitemap usam sozinhos o domínio de produção do projeto. `SITE_URL` só é necessário fora da Vercel, ou para forçar outro domínio.
- **Domínio próprio:** vercel.com → projeto → **Settings → Domains** → adicione o domínio e siga as instruções de DNS.

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
| Título, texto ou imagem da capa de uma página | `pages.json` | `title`, `lead`, `image` (chave de `images.manifest.json`). O build recusa imagem que não existe. |

Depois de editar, faça commit e push: a Vercel publica sozinha. Fora da Vercel, rode `npm run build` e publique o `dist/`. A contagem, a troca de estado e a linha do tempo "você está aqui" rodam no navegador e não precisam de rebuild para virar no horário.

## Testar datas (antes, no momento e depois)

Abra o site com `?agora=` e uma data ISO. Aparece uma faixa "MODO SIMULAÇÃO", e o relógio continua andando a partir dessa data. A simulação continua ao trocar de página; o botão **Sair da simulação** encerra.

- `http://localhost:4321/?agora=2026-11-18T23:59:50-03:00` mostra a virada do painel para LIBERADO e a transição.
- `http://localhost:4321/?agora=2026-11-25T12:00:00-03:00` mostra o estado DISPONÍVEL AGORA, com o tempo desde o lançamento.

O hub tem a opção **"Contar até: 0h de Brasília / meia-noite no meu fuso"**. A regra oficial da Rockstar é a liberação à meia-noite local em cada região.

## Verificações

| Comando | O que faz |
|---|---|
| `npm test` | Vitest da lógica do lançamento (antes, T-0 e depois) e do "você está aqui" da linha do tempo |
| `npm run e2e` | Playwright com relógio simulado: antes, T-0 com animação, depois, `?agora=`, visitante em Lisboa, mega menu, menu do celular e navegação entre páginas (precisa do `npm run preview` rodando) |
| `npm run screenshots` | Capturas de cada página e dos menus em desktop e iPhone na pasta `screenshots/` (`-- --full` salva a página inteira) |
| `npm run report:data` | Gera `research/DATA-REPORT.md` com cada dado, o selo e as fontes, e lista o que não é oficial |
| `npm run check:links` | Em todas as páginas do build: links entre páginas, âncoras, arquivos locais e links externos |
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
src/data/            todo o conteúdo (JSON), pages.json (cadastro das páginas) + images.manifest.json (gerado)
src/lib/             data.ts (validação Zod), launch-state.ts (lógica pura do lançamento), time.ts, seo.ts (JSON-LD)
src/pages/           uma rota por página + 404, sitemap.xml e robots.txt
src/layouts/         Base (head, menu, rodapé) e Page (capa de capítulo + "anterior / próxima")
src/components/      sections/ (uma por seção), hub/ (split-flap), ui/ (Picture, Badge, LoopClip…), layout/ (menu, capa, rodapé)
src/scripts/         relógio compartilhado, menu (nav.ts), efeitos (scramble, count up), timeline (GSAP), terrain, halftone
scripts/             assets, imagens, OG, e2e, screenshots, relatório de dados, links
public/assets/       imagens otimizadas · public/clips/ vídeos curtos (pendentes)
```
