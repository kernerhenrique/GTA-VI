import { now, onTick, refreshLaunchState, vi } from './clock';
import { initReveal, initScramble, initCountUp, initTilt, initLazyVideos } from './fx';
import { timeUntil, pad2 } from '../lib/launch-state';

refreshLaunchState(true);

// Navegação por âncora com content-visibility: renderiza tudo antes de rolar, para cair no lugar certo.
function jumpTo(hash: string) {
  const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (!target) return false;
  document.documentElement.classList.add('cv-off');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    // salto instantâneo: rolagem suave por dezenas de milhares de px é lenta e pode ser interrompida
    target.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    if (target instanceof HTMLElement && !target.hasAttribute('tabindex') && target.tagName !== 'A') target.setAttribute('tabindex', '-1');
    (target as HTMLElement).focus?.({ preventScroll: true });
  }));
  return true;
}
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
  const hash = a.getAttribute('href')!;
  if (jumpTo(hash)) { e.preventDefault(); history.pushState(null, '', hash); }
});
if (location.hash) jumpTo(location.hash);
addEventListener('popstate', () => { if (location.hash) jumpTo(location.hash); });

// Menu mobile
const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
const nav = document.querySelector<HTMLElement>('[data-nav]');
btn?.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('is-open', open);
});
nav?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) { btn?.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('is-open')) { btn?.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); btn?.focus(); }
});

// Faixa do modo simulação
if (vi().simulated) {
  const b = document.querySelector<HTMLElement>('[data-sim-banner]');
  if (b) {
    b.hidden = false;
    const fmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Sao_Paulo' });
    onTick((t) => { b.textContent = `MODO SIMULAÇÃO · ${fmt.format(t)} (Brasília) · remova ?agora= da URL para sair`; });
  }
}

// Mini contador no cabeçalho
const mini = document.querySelector<HTMLElement>('[data-mini-text]');
if (mini) {
  onTick((t) => {
    const state = document.documentElement.dataset.launch;
    if (state === 'pre') {
      const p = timeUntil(t, vi().target);
      mini.textContent = p.days > 0 ? `${p.days}d ${pad2(p.hours)}h ${pad2(p.minutes)}m` : `${pad2(p.hours)}:${pad2(p.minutes)}:${pad2(p.seconds)}`;
    } else mini.textContent = 'DISPONÍVEL';
  });
}

// Fallback do céu por rolagem (quando não há CSS scroll-driven animations)
if (!CSS.supports('animation-timeline: scroll()')) {
  let raf = 0;
  const upd = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--sky-progress', String(max > 0 ? Math.min(1, scrollY / max) : 0));
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
  upd();
}

initReveal();
initScramble();
initCountUp();
initTilt();
initLazyVideos();
void now;
