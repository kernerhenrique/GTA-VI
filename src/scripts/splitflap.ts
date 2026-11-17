import { reducedMotion } from './clock';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FLIP_MS = 130; // cada metade; o flip completo leva 2× isso

interface Tile {
  el: HTMLElement;
  top: HTMLElement; bottom: HTMLElement; leafTop: HTMLElement; leafBottom: HTMLElement;
  value: string;
  queue: string[];
  busy: boolean;
}

function makeTile(el: HTMLElement): Tile {
  const q = (s: string) => el.querySelector<HTMLElement>(`${s} > span`)!;
  return { el, top: q('.flap-top'), bottom: q('.flap-bottom'), leafTop: q('.flap-leaf-top'), leafBottom: q('.flap-leaf-bottom'), value: '', queue: [], busy: false };
}

function render(t: Tile, next: string) {
  const prev = t.value;
  t.value = next;
  if (reducedMotion() || prev === '') {
    t.top.textContent = t.bottom.textContent = t.leafTop.textContent = t.leafBottom.textContent = next;
    return Promise.resolve();
  }
  // Física do flip: a metade de cima do valor antigo dobra para baixo; a metade de baixo do novo desce no lugar.
  t.top.textContent = next;
  t.bottom.textContent = prev;
  t.leafTop.textContent = prev;
  t.leafBottom.textContent = next;
  t.el.style.setProperty('--flip-ms', `${FLIP_MS}ms`);
  t.el.classList.remove('is-flipping');
  void t.el.offsetWidth;
  t.el.classList.add('is-flipping');
  return new Promise<void>((res) => {
    setTimeout(() => {
      t.bottom.textContent = next;
      t.leafTop.textContent = next;
      t.el.classList.remove('is-flipping');
      res();
    }, FLIP_MS * 2 + 10);
  });
}

async function run(t: Tile) {
  if (t.busy) return;
  t.busy = true;
  while (t.queue.length) {
    const next = t.queue.shift()!;
    if (next !== t.value) await render(t, next);
  }
  t.busy = false;
}

export function createBoard(root: HTMLElement) {
  const tiles = [...root.querySelectorAll<HTMLElement>('[data-flap]')].map(makeTile);
  return {
    /** Atualiza os 8 dígitos; só vira o tile que mudou. */
    setDigits(digits: string) {
      tiles.forEach((t, i) => {
        t.el.classList.remove('is-letter');
        const d = digits[i] ?? '0';
        if (d !== t.value && !t.queue.includes(d)) { t.queue = [d]; run(t); }
      });
    },
    /** Mostra uma palavra sem animação (ex.: quem chega depois do lançamento). */
    setWord(word: string) {
      tiles.forEach((t, i) => { t.queue = []; t.el.classList.add('is-letter'); render(t, word[i] ?? ' '); t.value = word[i] ?? ' '; });
      tiles.forEach((t, i) => { t.top.textContent = t.bottom.textContent = t.leafTop.textContent = t.leafBottom.textContent = word[i] ?? ' '; });
    },
    /** T-0: cada tile passa por letras aleatórias e termina na palavra (o 1º vira 4×, cada próximo 1× a mais). */
    flipToWord(word: string) {
      if (reducedMotion()) { this.setWord(word); return; }
      tiles.forEach((t, i) => {
        t.el.classList.add('is-letter');
        const n = 4 + i;
        const seq: string[] = [];
        for (let k = 0; k < n; k++) seq.push(LETTERS[(Math.random() * LETTERS.length) | 0]);
        seq.push(word[i] ?? ' ');
        t.queue = seq;
        run(t);
      });
    },
  };
}
