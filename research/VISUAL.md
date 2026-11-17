# Direção visual — extraída do material oficial

> Fontes (acessadas em 17/11/2026):
> - CSS global do site oficial: `rockstargames.com/VI/_next/static/chunks/0czbqxa24cdz1.css`;
> - estilos inline do HTML de `rockstargames.com/VI`;
> - extração de branding (Firecrawl) da mesma página;
> - key art, postais e capa oficiais.
>
> **Nenhum hex abaixo foi chutado**: cada um tem origem anotada. Tons com transparência e escuros são *derivados* (transparência ou mistura de dois tokens oficiais) e estão marcados como tal.

## 1. Paleta oficial

| Token | Hex | Onde aparece no site oficial |
|---|---|---|
| `--vi-night` | `#0C0D1B` | Fundo das páginas (extração de branding: `background`/`primary`) |
| `--vi-ink` | `#111117` | `body{background:#111117}` no CSS global |
| `--vi-dusk` | `#243152` | Cor secundária (azul do crepúsculo) |
| `--vi-plum` | `#4B2F54` | Fundo dos botões primários ("Pre-Order Now") |
| `--vi-plum-deep` | `#543654` | Texto das pílulas: `color: rgb(84,54,84)` |
| `--vi-lavender` | `#CCC2F5` | Links |
| `--vi-cream` | `#FFF9CB` | Texto dos botões primários |
| `--vi-peach` | `#FEC497` | Início do gradiente do bloco "Vice City, USA." (`rgb(254,196,151)`) |
| `--vi-pink` | `#E9639B` | Fim do mesmo gradiente (`rgb(233,99,155)`) |
| `--vi-blush` | `#FEC9D8` | Fundo das pílulas: `background: rgb(254,201,216)` |
| `--vi-glow` | `#FFB3C7` (α 0.345) | Sombra das pílulas: `box-shadow: rgba(255,179,199,.345) 0 2px 66px` |
| `--vi-mist` | `#E2E2E4` | Cinza claro de UI (`rgb(226,226,228)`) |

**Gradiente-assinatura (oficial, literal):**
```css
background-image: linear-gradient(0deg, #FEC497 10%, #E9639B 100%);
/* peach embaixo → pink em cima: o pôr do sol de Vice City */
```

**Derivados (não oficiais, gerados a partir dos tokens acima):**
- `--vi-surface` = `#111117` a 88% sobre `--vi-night`, para cards e painéis com texto;
- `--vi-line` = `#CCC2F5` a 18%, para bordas finas;
- `--vi-pink-glow` = `#E9639B` a 45%, para o glow neon.

## 2. Céu de fundo (motivo do pôr do sol para a noite)
É uma camada fixa que muda com a rolagem (CSS scroll-driven animation, com fallback em JS via `--sky-progress`):
1. **Topo (hero):** `#FEC497 → #E9639B → #4B2F54`, o pôr do sol.
2. **Meio:** `#4B2F54 → #243152`, o crepúsculo.
3. **Fim:** `#243152 → #0C0D1B`, a noite.

Silhuetas de palmeiras e skyline art déco (SVG próprio, preenchido em `#0C0D1B`) ficam no rodapé do hero, com parallax leve (só `transform`).

## 3. Tipografia
- **Oficial:** "GTA Art Deco" (Regular, Medium, Bold, Condensed Bold, Condensed Heavy), carregada no CSS da Rockstar como `GTAArtDeco_*.woff`. É **proprietária e não será usada**.
- **Substitutas livres** (OFL, self-hosted via `@fontsource`, `font-display: swap`):
  - **Display:** *Big Shoulders Display* 800/900. É condensada, alta e de clima art déco, e fica em caixa alta nos títulos gigantes (`clamp(3rem, 12vw, 10rem)`, `letter-spacing: -0.01em`, `line-height: .85`).
  - **Corpo:** *Inter* (variável), 16–18px, `line-height: 1.6`.
  - **Mono:** *JetBrains Mono* 500/700, no painel split-flap, nos contadores e no scramble.
- **Não recriar o logo oficial.** Onde o logo aparecer, usar a imagem oficial com crédito "© Rockstar Games".

## 4. Motivos visuais (do material oficial)
- **Postais "Visit Leonida"** (há um por região no site oficial), com tipografia retrô de cartão-postal. Inspiram os cards do mapa.
- **Capa em mosaico**, o grid de painéis clássico da série. Inspira o layout dos itens das edições.
- **Fauna e ícones:** palmeiras, flamingos, jacarés, Macca the Gator, neon cor-de-rosa, art déco pastel, lanchas e asfalto molhado.
- **Pílulas arredondadas** (~34px de raio), com glow rosa (`0 2px 66px rgba(255,179,199,.345)`).
- **Taglines oficiais:** "Vice City, USA." / "Only in Leonida" / "the darkest side of the sunniest place in America". No site viram "Vice City, EUA.", "Só em Leonida" e "o lado mais sombrio do lugar mais ensolarado dos Estados Unidos" (esta última é tradução oficial da PS Store BR).

## 5. Textura e profundidade
- **Grão de filme:** ruído SVG (`feTurbulence`) em tile, opacidade 0.05–0.07, fixo, com `pointer-events:none`.
- **Scanlines/VHS:** só no painel split-flap, nos frames de vídeo e nos cards de "vazamento" da linha do tempo.
- **Glow neon:** `text-shadow` / `box-shadow` com `--vi-pink` e `--vi-lavender`.
- **Sombras coloridas:** cards com `0 20px 60px -20px rgba(233,99,155,.35)`.

## 6. Acessibilidade e contraste (WCAG AA)
| Combinação | Contraste aprox. | Uso |
|---|---|---|
| `#FFF9CB` sobre `#4B2F54` | ~10:1 | botões |
| `#CCC2F5` sobre `#0C0D1B` | ~11:1 | links |
| `#E9639B` sobre `#0C0D1B` | ~5.6:1 | destaques ≥ 18px |
| `#543654` sobre `#FEC9D8` | ~7:1 | pílulas e selos |
| `#E2E2E4` sobre `#111117` | ~15:1 | texto de corpo |

Regra: **texto nunca vai direto sobre o gradiente**. Ele fica sempre sobre `--vi-surface` ou com um scrim escuro de ≥ 70%.

## 7. Selos de veracidade
- **CONFIRMADO:** pílula `#FEC9D8` com texto `#543654`.
- **REPORTADO:** contorno `#CCC2F5` com texto `#CCC2F5`.
- **RUMOR:** contorno tracejado `#FEC497` com texto `#FEC497`.

Os três têm ícone e texto, e não dependem só da cor.
