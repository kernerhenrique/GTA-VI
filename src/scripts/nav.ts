/**
 * Menu do site:
 * - barra que encolhe e escurece ao rolar (IntersectionObserver num sentinela, sem listener de scroll);
 * - mega menu "O Jogo" (padrão disclosure: botão com aria-expanded; abre no clique e no hover com mouse);
 * - menu do celular em tela cheia com <dialog> nativo (foco preso, Esc fecha, fundo inerte).
 */
export function initNav() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  // Barra "rolada"
  const sentinel = document.querySelector('[data-top-sentinel]');
  if (sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting)).observe(sentinel);
  }

  // Mega menu
  const item = header.querySelector<HTMLElement>('[data-mega-item]');
  const btn = header.querySelector<HTMLButtonElement>('[data-mega-btn]');
  const panel = header.querySelector<HTMLElement>('[data-mega]');
  if (item && btn && panel) {
    let timer = 0;
    const set = (open: boolean) => {
      clearTimeout(timer);
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      header.classList.toggle('mega-open', open);
    };
    const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
    btn.addEventListener('click', () => set(!isOpen()));
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      clearTimeout(timer);
      timer = window.setTimeout(() => set(true), 90);
    });
    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      clearTimeout(timer);
      timer = window.setTimeout(() => set(false), 220);
    });
    item.addEventListener('focusout', (e) => {
      const to = e.relatedTarget as Node | null;
      if (to && !item.contains(to)) set(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !item.contains(e.target as Node)) set(false);
    });
    // ao clicar num link do painel, fecha (a navegação segue normal)
    panel.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) set(false); });
  }

  // Menu do celular
  const mBtn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const dialog = document.querySelector<HTMLDialogElement>('[data-mobile-menu]');
  if (mBtn && dialog && typeof dialog.showModal === 'function') {
    const close = () => { if (dialog.open) dialog.close(); };
    mBtn.addEventListener('click', () => {
      dialog.showModal();
      mBtn.setAttribute('aria-expanded', 'true');
      document.documentElement.classList.add('menu-open');
    });
    dialog.addEventListener('close', () => {
      mBtn.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('menu-open');
      mBtn.focus();
    });
    dialog.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', close));
    // clique fora do conteúdo (no ::backdrop) fecha
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    // qualquer link fecha o menu: numa âncora da mesma página ele precisa sair da frente, e ao voltar pelo
    // histórico (bfcache) a página não pode reaparecer com o menu aberto
    dialog.addEventListener('click', (e) => {
      const a = (e.target as HTMLElement).closest('a');
      if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) close();
    });
    // ao voltar para a página pelo histórico (bfcache), o menu não pode continuar aberto
    addEventListener('pageshow', close);
    // se a tela crescer para o layout de desktop, fecha
    matchMedia('(min-width: 1080px)').addEventListener('change', (e) => { if (e.matches) close(); });
  }
}
