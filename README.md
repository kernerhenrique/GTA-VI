# Leonida BR — fan site de GTA VI (pt-BR)

Fan site **não oficial** sobre Grand Theft Auto VI. Ele traz a contagem regressiva para o lançamento (19/11/2026, 0h de Brasília), as edições e os preços em R$, personagens, o estado de Leonida, trailers, uma linha do tempo animada, a recepção da crítica, um FAQ e as fontes de tudo, em **11 páginas**, mais uma página de apoio. O site funciona **antes, no momento e depois** do lançamento: o hub muda sozinho de estado.

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
npm run build
```

Servir o build localmente:

```bash
npm run preview
```

- O resultado estático fica em `dist/`. O site está hospedado na Cloudflare (veja abaixo), mas funciona em qualquer serviço estático.
- **Endereço do site:** canonical, Open Graph, JSON-LD e sitemap usam https://gta-vi.leonidabr.workers.dev (`PRODUCTION_URL` em `astro.config.mjs`). Para outro domínio, use `SITE_URL=https://seu-dominio.com.br npm run build`.

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
| `/apoie` | Apoio via Pix: o que vem por aí e o diário de atualizações (fora da numeração de capítulos) |

- **Cadastro:** título de SEO, descrição, capa, ordem e o que aparece no menu vêm de `src/data/pages.json`. Para mudar o texto de uma capa ou a ordem de leitura, edite esse arquivo.
- **Página nova:** crie `src/pages/<slug>.astro` com o layout `Page` e cadastre o slug em `pages.json`. O menu do celular, o rodapé, a home, o "anterior / próxima" e o `sitemap.xml` se atualizam sozinhos; para aparecer na barra do desktop, inclua o slug em `header`.
- **Menu do desktop:** em `pages.json → header`, `game` são os cards do painel "O Jogo", `primary` os links da barra e `shortcuts` os atalhos do painel.

## Publicação na Cloudflare

O site fica na **Cloudflare**, como um Worker só de arquivos estáticos. O plano grátis não tem limite de tráfego para arquivos estáticos e permite uso comercial, que é o caso de um site com doação via Pix e links de afiliado. O plano grátis da Vercel proíbe isso.

**Primeira vez:** dash.cloudflare.com → **Workers & Pages** → **Create** → **Import a repository** → `kernerhenrique/GTA-VI`. Preencha assim:

| Campo | Valor |
|---|---|
| Project name | `gta-vi` (precisa ser igual ao `name` do `wrangler.jsonc`) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Enable Preview builds | desligado (só existe uma branch) |
| Protect with Cloudflare Access | **desligado**. Ligado, o site pede login para qualquer visitante. |
| Path | `/` |
| API token | **Create new token** (deixe criar automaticamente) |
| Variáveis | nenhuma |

O endereço do site é **https://gta-vi.leonidabr.workers.dev** (o subdomínio `leonidabr` se troca em Workers & Pages → Account details → Subdomain).

**Depois disso:**
- **Publicação:** cada push na branch de produção (`claude/gifted-einstein-n2up3b`, a branch padrão do repositório) publica o site sozinho.
- **Configuração:**
  - `wrangler.jsonc`:
    - serve a pasta `dist/`;
    - `/comprar` usa o `comprar.html`, e `/comprar.html` redireciona para `/comprar`;
    - endereço inexistente mostra o `404.html`;
  - `public/_headers`: cache das imagens e dos arquivos `/_astro`;
  - `.node-version`: Node 22;
  - o Wrangler tem versão fixa no `package.json`.
- **Testar como na Cloudflare, no seu computador:**
  - `npm run build` e depois `npx wrangler dev` (abre em http://localhost:8787);
  - `npx wrangler deploy --dry-run` valida a configuração sem publicar.
- **Endereço do site:** o canonical, o Open Graph e o sitemap usam o `PRODUCTION_URL` do `astro.config.mjs`. Se o endereço mudar (outro subdomínio ou domínio próprio), troque ali ou defina `SITE_URL` em **Settings → Build → Variables and secrets**.
- **Logs:** se um deploy falhar, o motivo aparece no projeto → **Deployments** → **View build log**. O build roda o `astro check`, então um JSON com erro também derruba o deploy, com a mensagem dizendo o arquivo e o campo.
- **Domínio próprio:** no projeto → **Settings → Domains & Routes** → **Add** → **Custom domain**. Depois, troque o `SITE_URL`.
- **Alternativa com Cloudflare Pages:** também funciona sem mudar nada. Na tela **Create**, use o link "Looking to deploy Pages? Get started", com o preset Astro, o build `npm run build` e a pasta `dist`.
- **Vercel:** se o projeto antigo ainda estiver ligado ao repositório, apague-o ou desconecte o Git (vercel.com → projeto → **Settings → Git → Disconnect**). Senão cada push continua publicando lá também, e com o Pix isso conta como uso comercial no plano grátis.

## Apoio (Pix) e links de afiliado

| Quero… | Edite | Como |
|---|---|---|
| Trocar a chave Pix | `support.json → pix.key` | Use sempre uma **chave aleatória**, nunca CPF, telefone ou e-mail. O bloco de apoio só aparece se houver chave. |
| Mostrar QR Code e "Pix copia e cola" | `support.json → pix.name` e `pix.city` | O nome e a cidade da sua conta, sem acento, até 25 e 15 letras. Com os dois preenchidos, a página `/apoie` gera o QR Code no build. |
| Registrar uma novidade do site | `support.json → updates` | Adicione no topo: `{ "date": "2026-11-25", "text": "…" }`. Aparece no "Diário de bordo" da página `/apoie`. |
| Mudar o texto do convite | `support.json` | `headline`, `pitch` (página `/apoie`), `bandText` (faixa nas outras páginas), `roadmap` e `promises`. |
| Ganhar comissão da Amazon | `affiliate.json → amazonTag` | A sua tag do Amazon Associados (associados.amazon.com.br), no formato `seunome-20`. Sem tag, os links funcionam, mas não rendem comissão. |
| Trocar os produtos | `affiliate.json → items` | `title`, `text` e `query` (o termo de busca na Amazon). **Não coloque preço nem foto da Amazon:** as regras do programa só permitem isso pela API oficial. O aviso "Como associado da Amazon…" é obrigatório e já aparece no bloco. |

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

Depois de editar, faça commit e push: a Cloudflare publica sozinha. Em outra hospedagem, rode `npm run build` e publique o `dist/`. A contagem, a troca de estado e a linha do tempo "você está aqui" rodam no navegador e não precisam de rebuild para virar no horário.

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
