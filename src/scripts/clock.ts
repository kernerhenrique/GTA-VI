import { getLaunchState, localMidnightMs, type LaunchState } from '../lib/launch-state';

export interface ViGlobal {
  offset: number;
  simulated: boolean;
  target: number;
  releaseMs: number;
  windowMs: number;
  localDate: string;
}
declare global {
  interface Window { __vi: ViGlobal }
}

export const vi = (): ViGlobal => window.__vi;
/** "Agora" — respeita a simulação via ?agora= (o relógio continua andando a partir da data simulada). */
export const now = (): number => Date.now() + (window.__vi?.offset ?? 0);
export const reducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;

export type TargetMode = 'brasil' | 'local';
export function getTargetMode(): TargetMode {
  try { return localStorage.getItem('vi-target') === 'local' ? 'local' : 'brasil'; } catch { return 'brasil'; }
}
export function setTargetMode(mode: TargetMode) {
  try { localStorage.setItem('vi-target', mode); } catch { /* sem storage: só nesta visita */ }
  window.__vi.target = mode === 'local' ? localMidnightMs(window.__vi.localDate) : window.__vi.releaseMs;
  refreshLaunchState(true);
}

let current: LaunchState | null = null;
/** Recalcula o estado global; dispara 'vi:launch' quando muda. */
export function refreshLaunchState(force = false): LaunchState {
  const g = vi();
  const s = getLaunchState(now(), { releaseMs: g.target, launchWindowMs: g.windowMs });
  if (s !== current || force) {
    const prev = current;
    current = s;
    document.documentElement.dataset.launch = s;
    document.dispatchEvent(new CustomEvent('vi:launch', { detail: { state: s, prev } }));
  }
  return s;
}

/** Um único "tick" por segundo compartilhado por todos os módulos. */
type Tick = (nowMs: number) => void;
const ticks = new Set<Tick>();
let timer: number | undefined;
export function onTick(fn: Tick) {
  ticks.add(fn);
  fn(now());
  if (timer === undefined) {
    const loop = () => {
      const t = now();
      refreshLaunchState();
      ticks.forEach((f) => f(t));
      timer = window.setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
    };
    timer = window.setTimeout(loop, 1000 - (Date.now() % 1000) + 5);
  }
  return () => ticks.delete(fn);
}

/** Um IntersectionObserver compartilhado por rootMargin (evita centenas de observers). */
const observers = new Map<string, { io: IntersectionObserver; cbs: WeakMap<Element, Array<() => void>> }>();
export function whenVisible(el: Element, cb: () => void, rootMargin = '200px') {
  if (!('IntersectionObserver' in window)) { cb(); return; }
  let entry = observers.get(rootMargin);
  if (!entry) {
    const cbs = new WeakMap<Element, Array<() => void>>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const list = cbs.get(e.target) ?? [];
        cbs.delete(e.target);
        list.forEach((f) => f());
      });
    }, { rootMargin });
    entry = { io, cbs };
    observers.set(rootMargin, entry);
  }
  const list = entry.cbs.get(el) ?? [];
  list.push(cb);
  entry.cbs.set(el, list);
  entry.io.observe(el);
}
