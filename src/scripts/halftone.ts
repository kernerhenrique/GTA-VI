/** Halftone Wave: pontos numa grade a 45° cujo tamanho segue uma ondulação circular. Pausado fora da tela. */
export function startHalftone(canvas: HTMLCanvasElement, still: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let w = 0, h = 0, raf = 0, running = false;
  const t0 = performance.now();
  const resize = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const gap = 22;
  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5 + Math.cos(t * 0.3) * w * 0.08;
    const cy = h * 0.45 + Math.sin(t * 0.25) * h * 0.06;
    const grow = Math.min(1, t / 1.6);
    ctx.fillStyle = '#E9639B';
    const diag = Math.hypot(w, h);
    for (let gy = -diag; gy < diag; gy += gap) {
      for (let gx = -diag; gx < diag; gx += gap) {
        const x = (gx - gy) * 0.7071 + w / 2, y = (gx + gy) * 0.7071 + h / 2;
        if (x < -gap || y < -gap || x > w + gap || y > h + gap) continue;
        const dist = Math.hypot(x - cx, y - cy);
        const ripple = (Math.sin(dist * 0.035 - t * 2.2) + 1) / 2;
        const edge = 1 - Math.min(1, dist / (diag * 0.55));
        const r = (still ? 0.35 : ripple) * 4.2 * edge * (still ? 1 : grow);
        if (r < 0.3) continue;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    if (running && !still) raf = requestAnimationFrame(draw);
  };
  resize();
  addEventListener('resize', () => { resize(); if (still) draw(performance.now()); }, { passive: true });
  if (still) { draw(performance.now()); return; }
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(draw); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(canvas);
}
