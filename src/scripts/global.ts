import { now, onTick, refreshLaunchState, vi } from './clock';
import { initReveal, initScramble, initCountUp, initTilt, initLazyVideos } from './fx';
import { timeUntil, pad2 } from '../lib/launch-state';
import { initNav } from './nav';

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
const samePath = (a: string, b: string) => a.replace(/(\.html|\/)$/, '') === b.replace(/(\.html|\/)$/, '');
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  // só links para a própria página (ex.: "#hub" ou "/#hub" estando na home)
  if (url.origin !== location.origin || !samePath(url.pathname, location.pathname) || !url.hash) return;
  if (jumpTo(url.hash)) { e.preventDefault(); history.pushState(null, '', url.hash); }
});
if (location.hash) jumpTo(location.hash);
addEventListener('popstate', () => { if (location.hash) jumpTo(location.hash); });

initNav();

// Faixa do modo simulação (a simulação segue ao trocar de página; o botão encerra)
if (vi().simulated) {
  const b = document.querySelector<HTMLElement>('[data-sim-banner]');
  const txt = b?.querySelector<HTMLElement>('[data-sim-text]');
  if (b && txt) {
    b.hidden = false;
    const fmt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Sao_Paulo' });
    onTick((t) => { txt.textContent = `MODO SIMULAÇÃO · ${fmt.format(t)} (Brasília)`; });
    b.querySelector('[data-sim-exit]')?.addEventListener('click', () => {
      try { sessionStorage.removeItem('vi-sim'); } catch { /* sem storage */ }
      location.href = location.pathname + location.hash;
    });
  }
}

// Contador do cabeçalho (barra e menu do celular)
const minis = document.querySelectorAll<HTMLElement>('[data-mini-countdown]');
if (minis.length) {
  onTick((t) => {
    const pre = document.documentElement.dataset.launch === 'pre';
    let text = 'AGORA';
    if (pre) {
      const p = timeUntil(t, vi().target);
      text = p.days > 0 ? `${p.days}d ${pad2(p.hours)}h ${pad2(p.minutes)}m` : `${pad2(p.hours)}:${pad2(p.minutes)}:${pad2(p.seconds)}`;
    }
    minis.forEach((m) => {
      const label = m.querySelector('[data-mini-label]');
      const value = m.querySelector('[data-mini-text]');
      if (label) label.textContent = pre ? 'Faltam' : 'Disponível';
      if (value) value.textContent = text;
      m.classList.toggle('is-live', !pre);
    });
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
