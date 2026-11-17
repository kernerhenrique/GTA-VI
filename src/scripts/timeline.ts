/**
 * Linha do tempo animada: uma "rodovia" SVG que se desenha com a rolagem (ScrollTrigger scrub — sem pin, sem scroll-jacking),
 * um marcador neon que percorre a estrada, nós que acendem e o nó "você está aqui" calculado pela data atual.
 */
import { now, onTick, reducedMotion } from './clock';
import { getTimelineProgress } from '../lib/launch-state';
import { scramble } from './fx';

interface Geo { d: string; L: number; nodeLens: number[]; hereLen: number; hereY: number; hereX: number }

export async function initTimeline(root: HTMLElement) {
  const road = root.querySelector<SVGPathElement>('.tl-road')!;
  const future = root.querySelector<SVGPathElement>('.tl-future')!;
  const draw = root.querySelector<SVGPathElement>('.tl-draw')!;
  const marker = root.querySelector<HTMLElement>('[data-tl-marker]')!;
  const list = root.querySelector<HTMLElement>('[data-tl-list]')!;
  const here = root.querySelector<HTMLElement>('[data-tl-here]')!;
  const hereDate = root.querySelector<HTMLElement>('[data-tl-here-date]')!;
  const allItems = [...root.querySelectorAll<HTMLElement>('[data-tl-item]')];
  const rm = reducedMotion();
  if (rm) root.classList.add('no-motion');

  let progress = 0;
  let geo: Geo = { d: '', L: 0, nodeLens: [], hereLen: 0, hereY: 0, hereX: 0 };
  let states: Array<'past' | 'future'> = [];

  const visibleItems = () => allItems.filter((i) => !i.classList.contains('is-hidden'));

  function updateStates(): boolean {
    const prog = getTimelineProgress(allItems.map((i) => i.dataset.date!), now());
    const changed = prog.states.join() !== states.join();
    states = prog.states;
    allItems.forEach((it, i) => it.classList.toggle('is-future', states[i] === 'future'));
    return changed;
  }

  function nodeCenter(it: HTMLElement, rootRect: DOMRect) {
    const n = it.querySelector<HTMLElement>('.tl-node')!.getBoundingClientRect();
    return { x: n.left + n.width / 2 - rootRect.left, y: n.top + n.height / 2 - rootRect.top };
  }

  function lengthAtY(path: SVGPathElement, L: number, y: number) {
    let lo = 0, hi = L;
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).y < y) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function build() {
    const rootRect = root.getBoundingClientRect();
    const items = visibleItems();
    if (!items.length) return;
    const pts = items.map((it) => nodeCenter(it, rootRect));
    const wide = matchMedia('(min-width: 900px)').matches;
    const amp = wide ? Math.min(90, rootRect.width * 0.06) : 0;
    const x0 = pts[0].x;
    let d = `M ${x0} 0 L ${x0} ${Math.max(0, pts[0].y - 40)}`;
    let prev = { x: x0, y: Math.max(0, pts[0].y - 40) };
    pts.forEach((p, i) => {
      const dy = p.y - prev.y;
      const sway = (i % 2 === 0 ? 1 : -1) * amp;
      d += ` C ${prev.x + sway} ${prev.y + dy * 0.45}, ${p.x + sway} ${p.y - dy * 0.45}, ${p.x} ${p.y}`;
      prev = p;
    });
    const endY = root.offsetHeight;
    d += ` L ${prev.x} ${endY}`;
    [road, future, draw].forEach((p) => p.setAttribute('d', d));
    const L = draw.getTotalLength();
    const nodeLens = pts.map((p) => lengthAtY(draw, L, p.y));

    // "Você está aqui": entre o último evento passado e o próximo futuro
    const vis = items.map((it) => it.classList.contains('is-future') ? 'future' : 'past');
    const lastPast = vis.lastIndexOf('past');
    let hereY: number;
    if (lastPast === -1) hereY = pts[0].y - 30;
    else if (lastPast === pts.length - 1) hereY = Math.min(endY - 20, pts[lastPast].y + 70);
    else hereY = (pts[lastPast].y + pts[lastPast + 1].y) / 2;
    const hereLen = lengthAtY(draw, L, hereY);
    const hp = draw.getPointAtLength(hereLen);
    geo = { d, L, nodeLens, hereLen, hereY: hp.y, hereX: hp.x };

    here.hidden = false;
    here.style.top = `${hp.y}px`;
    here.style.left = `${hp.x}px`;
    hereDate.textContent = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(now());

    draw.style.strokeDasharray = `${L} ${L}`;
    road.style.strokeDasharray = '';
    render();
    root.classList.add('is-ready');
  }

  function render() {
    const { L, nodeLens, hereLen } = geo;
    if (!L) return;
    const travelled = rm ? hereLen : progress * L;
    const solid = Math.min(travelled, hereLen);
    draw.style.strokeDashoffset = String(L - solid);
    const mp = draw.getPointAtLength(Math.min(travelled, L));
    marker.style.transform = `translate(${mp.x}px, ${mp.y}px)`;
    const items = visibleItems();
    items.forEach((it, i) => it.classList.toggle('is-lit', !it.classList.contains('is-future') && nodeLens[i] <= travelled + 2));
  }

  updateStates();

  // Revelação dos cards + scramble da data
  const reveal = (it: HTMLElement) => {
    if (it.classList.contains('is-in')) return;
    it.classList.add('is-in');
    const s = it.querySelector<HTMLElement>('[data-tl-scramble]');
    if (s && !rm) scramble(s, 800);
  };

  if (rm) {
    allItems.forEach((it) => it.classList.add('is-in'));
    build();
  } else {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
    gsap.registerPlugin(ScrollTrigger);
    build();
    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      ease: 'none',
      scrollTrigger: { trigger: root, start: 'top 70%', end: 'bottom 70%', scrub: 0.6, invalidateOnRefresh: true },
      onUpdate: () => { progress = state.p; render(); },
    });
    ScrollTrigger.batch(allItems, {
      start: 'top 88%',
      onEnter: (batch) => batch.forEach((el, i) => setTimeout(() => reveal(el as HTMLElement), i * 90)),
    });
    let raf = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { build(); ScrollTrigger.refresh(); });
    });
    ro.observe(list);
    // seções com content-visibility acima mudam de altura ao renderizar: recalibrar os gatilhos
    let to = 0;
    new ResizeObserver(() => { clearTimeout(to); to = window.setTimeout(() => ScrollTrigger.refresh(), 200); }).observe(document.body);
    // imagens carregando mudam a altura: reconstruir
    root.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => { build(); ScrollTrigger.refresh(); }, { once: true }));
  }

  // Filtros por tipo
  const chips = document.querySelectorAll<HTMLButtonElement>('[data-tl-filter]');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.tlFilter!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    allItems.forEach((it) => {
      const show = f === 'todos' || it.dataset.type === f || it.classList.contains('tl-launch');
      it.classList.toggle('is-hidden', !show);
      if (show) reveal(it);
    });
    root.querySelectorAll<HTMLElement>('.tl-year').forEach((y) => {
      const yr = y.dataset.year!;
      y.classList.toggle('is-hidden', !allItems.some((it) => !it.classList.contains('is-hidden') && it.dataset.date!.startsWith(yr)));
    });
    requestAnimationFrame(build);
  }));

  // Quando a data de um evento chega, ele vira "passado" sozinho
  let lastCheck = 0;
  onTick((t) => {
    if (t - lastCheck < 30_000) return;
    lastCheck = t;
    if (updateStates()) build();
  });
  document.addEventListener('vi:launch', () => { if (updateStates()) build(); });
}
