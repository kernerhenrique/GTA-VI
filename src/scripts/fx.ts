import { reducedMotion, whenVisible } from './clock';

const GLYPHS = '!<>-_\\/[]{}—=+*^?#$%&@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** Scramble Decode: símbolos aleatórios que se resolvem da esquerda para a direita. */
export function scramble(el: HTMLElement, duration = 900) {
  const final = el.dataset.final ?? el.textContent ?? '';
  el.dataset.final = final;
  if (reducedMotion()) { el.textContent = final; return; }
  const len = final.length;
  const start = performance.now();
  let lastSwap = 0;
  const frame = (t: number) => {
    const p = Math.min(1, (t - start) / duration);
    if (t - lastSwap > 66 || p === 1) { // ~15 trocas por segundo
      lastSwap = t;
      const resolved = Math.floor(p * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = final[i];
        out += i < resolved || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    }
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = final;
  };
  requestAnimationFrame(frame);
}

/** Count Up com dígitos tabulares e easing out. */
export function countUp(el: HTMLElement) {
  const to = Number(el.dataset.countTo);
  const decimals = Number(el.dataset.decimals ?? 0);
  const prefix = el.dataset.prefix ?? '';
  const suffix = el.dataset.suffix ?? '';
  const fmt = (v: number) => prefix + v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
  if (!Number.isFinite(to)) return;
  if (reducedMotion()) { el.textContent = fmt(to); return; }
  const dur = Number(el.dataset.duration ?? 1600);
  const start = performance.now();
  const ease = (x: number) => 1 - Math.pow(1 - x, 4);
  const frame = (t: number) => {
    const p = Math.min(1, (t - start) / dur);
    el.textContent = fmt(to * ease(p));
    if (p < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  if (!('IntersectionObserver' in window) || reducedMotion()) { els.forEach((e) => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach((e) => io.observe(e));
}

export function initScramble() {
  document.querySelectorAll<HTMLElement>('[data-scramble-title] > span, [data-scramble]').forEach((el) => {
    whenVisible(el, () => scramble(el, el.closest('.badge') ? 600 : 1000), '0px');
  });
}

export function initCountUp() {
  document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => whenVisible(el, () => countUp(el), '0px'));
}

/** Tilt sutil em cards (só com ponteiro fino e sem movimento reduzido). */
export function initTilt() {
  if (reducedMotion() || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.classList.add('tilt');
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', `${x * 6}deg`);
      el.style.setProperty('--rx', `${-y * 6}deg`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/** Vídeos curtos: só carregam/tocam quando visíveis; pausam fora da tela. */
export function initLazyVideos() {
  const vids = document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]');
  if (!vids.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) {
        if (!v.dataset.loaded) {
          v.querySelectorAll<HTMLSourceElement>('source[data-src]').forEach((s) => (s.src = s.dataset.src!));
          v.load();
          v.dataset.loaded = '1';
        }
        if (!reducedMotion()) v.play().catch(() => {});
      } else v.pause();
    });
  }, { rootMargin: '100px' });
  vids.forEach((v) => io.observe(v));
}
