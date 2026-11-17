# Assets — imagens e vídeos curtos

Todo material visual oficial é **© Rockstar Games** e aparece no site com crédito. O site é um fan site sem afiliação com a Rockstar Games ou a Take-Two.

## 1. Imagens oficiais

- **Lista:** `scripts/assets.sources.json` (chave → URL oficial, texto alternativo em PT-BR, larguras).
- **Download:** `NODE_USE_ENV_PROXY=1 node scripts/fetch-assets.mjs` → originais em `assets-src/` (fora do git). Fora desta sessão em nuvem, basta `node scripts/fetch-assets.mjs`.
- **Otimização:** `node scripts/optimize-images.mjs` gera **AVIF + WebP** em várias larguras em `public/assets/` e o manifest `src/data/images.manifest.json` (dimensões, alt, blur e cor dominante). Use `--force` para regerar.
- **Imagem que falta:** se faltar o arquivo, o componente `<Picture>` mostra automaticamente um **placeholder na proporção certa** com o nome da chave. Nada quebra.
- **Imagem nova:** adicione a entrada em `assets.sources.json`, rode `npm run assets` e use a chave nos JSON de `src/data/`.

**Situação em 17/11/2026:** todas as 87 imagens foram baixadas e otimizadas. Nenhuma ficou pendente.

| Chave | Situação | Original | Larguras geradas | Texto alternativo |
|---|---|---|---|---|
| `hero-keyart` | ✅ baixada e otimizada | 2560×1440 | 640, 1024, 1600, 2400 | Arte oficial: Jason e Lucia abraçados numa praia de Vice City ao pôr do sol |
| `cover-art` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Arte de capa oficial de GTA VI: mosaico com Jason, Lucia, Boobie Ike, Raul Bautista, um flamingo sobre uma lancha, um jacaré e o logotipo no centro |
| `og-source` | ✅ baixada e otimizada | 1536×864 | 1200 | Jason e Lucia abraçados numa praia de Vice City ao pôr do sol |
| `char-jason-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Jason Duval ao volante, de regata, com palmeiras ao fundo |
| `char-jason-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Jason encostado numa árvore à noite, olhando o celular numa rua neon de Vice City |
| `char-lucia-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Lucia Caminos de luvas, desferindo um soco num treino de luta |
| `char-lucia-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Lucia de óculos escuros na borda de uma piscina, com um drinque ao lado |
| `char-cal-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Cal Hampton de chapéu e camisa florida num campo de minigolfe com estátua de jacaré |
| `char-cal-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Cal deitado numa boia rosa na piscina, cercado de latas |
| `char-boobie-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Boobie Ike em close, de óculos e corrente de ouro, segurando um copo |
| `char-boobie-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Boobie sentado numa poltrona, contando dinheiro no escritório |
| `char-drequan-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Dre'Quan Priest de colete laranja numa casa noturna iluminada |
| `char-drequan-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Dre'Quan num estúdio de gravação, ao lado da mesa de som |
| `char-realdimez-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Bae-Luxe e Roxy, as Real Dimez, gravando ao microfone no estúdio |
| `char-realdimez-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | As Real Dimez dançando no capô de um carro enquanto o público filma com celulares |
| `char-raul-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Raul Bautista de camisa branca e braços cruzados num iate ao pôr do sol |
| `char-raul-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Raul ao telefone diante de monitores, de óculos |
| `char-brian-1` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Brian Heder de óculos escuros, com o braço para fora da janela de um carro |
| `char-brian-2` | ✅ baixada e otimizada | 1536×864 | 400, 720, 1200 | Brian apontando para alguém enquanto segura um pacote |
| `postcard-vice-city` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Cartão-postal oficial "Visit Vice City" |
| `postcard-leonida-keys` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Cartão-postal oficial de Leonida Keys |
| `postcard-grassrivers` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Cartão-postal oficial de Grassrivers |
| `postcard-port-gellhorn` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Cartão-postal oficial de Port Gellhorn |
| `postcard-ambrosia` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Cartão-postal oficial de Ambrosia |
| `postcard-mount-kalaga` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Cartão-postal oficial de Mount Kalaga National Park |
| `region-vice-city` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Vista de Vice City com avenidas, palmeiras, uma quadra de basquete e prédios ao fundo |
| `region-leonida-keys` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Hidroavião sobre o mar de Leonida Keys; ao fundo, uma ponte liga duas ilhas |
| `region-grassrivers` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Vista de cima de duas pessoas num aerobarco cercado de jacarés em Grassrivers |
| `region-port-gellhorn` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Fachada de um motel em Port Gellhorn com a placa de vagas acesa à noite |
| `region-ambrosia` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Silhueta de Ambrosia à noite, com chaminés industriais ao fundo |
| `region-mount-kalaga` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Quatro motos de trilha atravessando a lama em Mount Kalaga, com um quadriciclo saltando atrás |
| `edition-standard` | ✅ baixada e otimizada | 1536×1920 | 400, 800, 1200 | Capa da Standard Edition de GTA VI |
| `edition-ultimate` | ✅ baixada e otimizada | 1536×1920 | 400, 800, 1200 | Capa da Ultimate Edition de GTA VI |
| `vintage-pack` | ✅ baixada e otimizada | 2048×1152 | 480, 960, 1600 | Jason e Lucia armados diante do Ocean View Hotel, com o '55 Vapid Stanier atrás |
| `vintage-stanier` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Jason e Lucia dentro do '55 Vapid Stanier estacionado à noite |
| `vintage-looks` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Jason e Lucia dançando numa boate com os visuais do Vintage Vice City Pack |
| `vintage-weapon` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Pistola com o padrão tropical do Vintage Vice City Pack no banco de couro de um carro |
| `gta-plus` | ✅ baixada e otimizada | 1280×640 | 480, 960 | Logotipo do GTA+ |
| `ue-cheetah` | ✅ baixada e otimizada | 1280×720 | 480, 960 | '95 Grotti Cheetah da Ultimate Edition |
| `ue-revolvers` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Revólveres Hawk & Little Morgan com cabos gravados com palmeiras |
| `ue-variants` | ✅ baixada e otimizada | 1280×720 | 480, 960 | As pistolas personalizadas de Jason e Lucia sobre uma toalha à beira da piscina |
| `ue-style` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Jason e Lucia relaxando à beira da piscina com roupas do Vice City Style |
| `ue-safehouse` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Casa de palafita à beira-mar com um carro amarelo estacionado, nos Keys |
| `ue-ganado` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Picape Vapid Ganado amarela com faixas vermelhas, do kit Retro Build |
| `ue-rideout` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Sedã dourado com rodas gigantes no estilo donk, da Rideout Customs |
| `ue-salon` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Jason de jaqueta de couro e Lucia de óculos com novos visuais de salão |
| `ue-squalo` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Lancha Shitzu Squalo em degradê rosa e azul |
| `ue-stock305` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Lucia encostada num carro com estampa, vestindo roupas da Stock 305 |
| `ue-buggy` | ✅ baixada e otimizada | 1280×720 | 480, 960 | '67 Vapid Dominator Buggy na lama |
| `ue-tattoo` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Fachada neon do estúdio Electric Fang Tattoo à noite |
| `ue-willies` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Picape off-road verde customizada na One-Eyed Willie's |
| `ue-goodtime` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Jason e Lucia com camisetas e bonés da Goodtime Gear de Vice City |
| `ue-ptt` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Invasão ao complexo da gangue PTT Youngin$, com motos e pessoas armadas |
| `ue-classics` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Jason entre carros clássicos abandonados à espera de restauração |
| `collector-box` | ✅ baixada e otimizada | 1024×1517 | 400, 800 | The Goodtime State – Vice City Collection: caixa de colecionador com Macca the Gator |
| `cb-macca` | ✅ baixada e otimizada | 828×466 | 320, 640 | Estatueta de Macca the Gator |
| `cb-oakleys` | ✅ baixada e otimizada | 828×466 | 320, 640 | Óculos Oakley Frogskins pretos com logo GTAVI rosa |
| `cb-cap` | ✅ baixada e otimizada | 828×466 | 320, 640 | Boné New Era 9FORTY de Vice City Leonida |
| `cb-bag` | ✅ baixada e otimizada | 828×466 | 320, 640 | Bolsa transversal Leonida Keys |
| `cb-mirror` | ✅ baixada e otimizada | 828×466 | 320, 640 | Espelho magnético rosa de Macca the Gator |
| `cb-razor` | ✅ baixada e otimizada | 828×466 | 320, 640 | Chaveiro em formato de lâmina com logos de Vice City |
| `cb-spoon` | ✅ baixada e otimizada | 828×466 | 320, 640 | Colher swizzle com logo de Vice City |
| `cb-shots` | ✅ baixada e otimizada | 828×466 | 320, 640 | Copo de shot de Chunkee the Manatee |
| `cb-pins` | ✅ baixada e otimizada | 828×466 | 320, 640 | Kit de pins esmaltados de Leonida Keys em lata |
| `cb-stickers` | ✅ baixada e otimizada | 828×466 | 320, 640 | Adesivos de Leonida Keys num saquinho |
| `cb-map` | ✅ baixada e otimizada | 828×466 | 320, 640 | Pôster dupla face com o mapa de Leonida |
| `radio-cocoteo` | ✅ baixada e otimizada | 640×640 | 200, 400 | Arte da rádio Cocoteo FM |
| `radio-backcountry` | ✅ baixada e otimizada | 640×640 | 200, 400 | Arte da Back Country Radio |
| `radio-afrobank` | ✅ baixada e otimizada | 640×640 | 200, 400 | Arte da AfroBank FM |
| `radio-chamber` | ✅ baixada e otimizada | 640×640 | 200, 400 | Arte da The Chamber 106.6 |
| `radio-flash` | ✅ baixada e otimizada | 640×640 | 200, 400 | Arte da Flash FM |
| `radio-dirtysouth` | ✅ baixada e otimizada | 640×640 | 200, 400 | Arte da Dirty South Classics |
| `album-cover` | ✅ baixada e otimizada | 828×828 | 320, 640 | Capa de Grand Theft Auto VI: The Album |
| `score-cover` | ✅ baixada e otimizada | 828×828 | 320, 640 | Capa do álbum da trilha original de GTA VI, do Justice |
| `thumb-t1` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Miniatura do Trailer 1 de GTA VI |
| `thumb-t2` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Miniatura do Trailer 2 de GTA VI |
| `thumb-ext` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Miniatura de An Extended Look |
| `thumb-launch` | ✅ baixada e otimizada | 1280×720 | 480, 960 | Miniatura do Launch Trailer de GTA VI |
| `break-jl-rooftop` | ✅ baixada e otimizada | 2560×1440 | 640, 1280, 1920 | Jason e Lucia num terraço com o skyline de Vice City ao anoitecer |
| `break-jl-motel` | ✅ baixada e otimizada | 2560×1440 | 640, 1280, 1920 | Jason e Lucia diante de um motel neon |
| `break-jl-robbery` | ✅ baixada e otimizada | 2560×1440 | 640, 1280, 1920 | Jason e Lucia mascarados durante um assalto |
| `compare-vc2026` | ✅ baixada e otimizada | 1843×1152 | 480, 960, 1600 | GTA VI (2026): uma avenida de Vice City com carros, motos de trilha e quadriciclos fazendo manobras |
| `compare-vc2002` | ✅ baixada e otimizada | 640×400 | 480, 640 | GTA Vice City (2002): um sedã vermelho em uma avenida com palmeiras |
| `break-vc-twilight` | ✅ baixada e otimizada | 2560×1440 | 640, 1280, 1920 | Vice City ao anoitecer: o trânsito espera dos dois lados de uma ponte levadiça enquanto uma lancha passa |
| `break-vc-gas` | ✅ baixada e otimizada | 2560×1440 | 640, 1280, 1920 | Posto de gasolina neon ao entardecer em Vice City, com um lowrider iluminado |
| `break-vc-marina` | ✅ baixada e otimizada | 2560×1440 | 640, 1280, 1920 | Marina ensolarada com lanchas e o skyline de Vice City ao fundo |
| `break-vc-night` | ✅ baixada e otimizada | 2560×1440 | 640, 1280, 1920 | Skyline de Vice City à noite com roda-gigante e carros nas avenidas |

### Observações
- **`compare-vc2002`**: a captura oficial do GTA Vice City (2002) só existe em 640×448 no site da Rockstar. Por isso o comparativo "antes e depois" fica limitado a 1000 px de largura, e a imagem de 2002 é naturalmente mais suave.
- **Mapa de Leonida**: o mapa do site é **esquemático e feito por fãs**, com posições aproximadas. A Rockstar prometeu o **mapa oficial de Leonida como download gratuito em 19/11** no site oficial. Quando sair, você pode linká-lo na seção Leonida ou trocar o fundo do SVG (`src/components/sections/Leonida.astro`).
- **Imagem de compartilhamento**: `public/og.jpg` é gerada por `node scripts/make-og.mjs` a partir de `og-source` (arte oficial) e da tipografia do site.

## 2. Vídeos curtos (3–8 s, loop, sem som) — PENDENTES

O componente `LoopClip` procura os arquivos `public/clips/<nome>.mp4`, `.webm` e `.jpg` (pôster). Os vídeos só carregam e tocam quando aparecem na tela e pausam ao sair dela. Enquanto o arquivo não existir, aparece a imagem de fallback, então **o site já funciona sem os clipes**.

> A minutagem não foi conferida: não foi possível assistir aos trailers neste ambiente. A coluna "Cena a procurar" descreve o trecho ideal; anote o tempo exato ao assistir e corte.
> Fonte dos vídeos: baixe os arquivos oficiais na área **Media › Videos** de https://www.rockstargames.com/VI/media (ou use o trailer no YouTube oficial). Não use reuploads.

| Arquivo (`public/clips/`) | Onde aparece | Vídeo de origem | Cena a procurar | Minutagem | Formato |
|---|---|---|---|---|---|
| `gameplay-break` | Jogabilidade (faixa larga entre os cards e a tabela técnica) | An Extended Look | direção noturna por Vice City com neon (ex.: posto de gasolina) | **a conferir** | 21:8 (corte 1280×488) |
| `reception-break` | Recepção (faixa larga no fim da seção) | Launch Trailer | Jason e Lucia juntos em ação (assalto/fuga) | **a conferir** | 21:8 (corte 1280×488) |
| `leonida-vice-city` | Leonida › painel da região Vice City | An Extended Look ou Trailer 2 | skyline/praia de Ocean Beach ou avenida com palmeiras | **a conferir** | 16:9 (1280×720) |
| `leonida-leonida-keys` | Leonida › painel da região Leonida Keys | An Extended Look ou Trailer 2 | ponte entre ilhas, mar turquesa, hidroavião | **a conferir** | 16:9 (1280×720) |
| `leonida-grassrivers` | Leonida › painel da região Grassrivers | An Extended Look ou Trailer 2 | aerobarco no pântano com jacarés | **a conferir** | 16:9 (1280×720) |
| `leonida-port-gellhorn` | Leonida › painel da região Port Gellhorn | An Extended Look ou Trailer 2 | motel/letreiro neon à noite ou moto de trilha | **a conferir** | 16:9 (1280×720) |
| `leonida-ambrosia` | Leonida › painel da região Ambrosia | An Extended Look ou Trailer 2 | motoqueiros na estrada ou chaminés da refinaria | **a conferir** | 16:9 (1280×720) |
| `leonida-mount-kalaga` | Leonida › painel da região Mount Kalaga | An Extended Look ou Trailer 2 | trilha off-road na mata ou rio entre montanhas | **a conferir** | 16:9 (1280×720) |

### Comandos ffmpeg (MP4 H.264 + WebM, sem áudio, ~720p, < 2 MB, com pôster)

Defina o início (`SS`), a duração (`T`, entre 3 e 8 s), o arquivo de origem e o nome do clipe:

```bash
SS=00:01:23 T=6 IN=trailer.mp4 NAME=leonida-grassrivers
```

MP4 (H.264, sem áudio, 720p, faststart):

```bash
ffmpeg -y -ss "$SS" -i "$IN" -t "$T" -an -vf "scale=-2:720,fps=30" -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart "public/clips/$NAME.mp4"
```

WebM (VP9, sem áudio):

```bash
ffmpeg -y -ss "$SS" -i "$IN" -t "$T" -an -vf "scale=-2:720,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -deadline good "public/clips/$NAME.webm"
```

Pôster (primeiro quadro, JPG):

```bash
ffmpeg -y -ss "$SS" -i "$IN" -frames:v 1 -vf "scale=-2:720" -q:v 3 "public/clips/$NAME.jpg"
```

Para as faixas largas (21:8), acrescente o corte central antes do `scale`:

```bash
ffmpeg -y -ss "$SS" -i "$IN" -t "$T" -an -vf "crop=iw:iw*8/21,scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart "public/clips/$NAME.mp4"
```

Conferir o tamanho (precisa ficar abaixo de 2 MB; se passar, aumente o `-crf` de 2 em 2):

```bash
ls -lh public/clips/
```

Depois de colocar os arquivos em `public/clips/`, rode `npm run build`. O `LoopClip` detecta os arquivos no build e troca a imagem pelo vídeo.

## 3. Trailers completos
Os trailers aparecem como **embed do YouTube com facade**: só a miniatura carrega, e o player (youtube-nocookie.com) é criado no clique. Os IDs ficam em `src/data/trailers.json`.
