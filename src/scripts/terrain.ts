/**
 * Terrain Mesh: voo sobre uma malha wireframe estilo synthwave, com o sol do pôr do sol no horizonte.
 * Canvas 2D, 3D "na mão" (projeção em perspectiva), pausado fora da tela.
 */
export function startTerrain(canvas: HTMLCanvasElement, host: HTMLElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const COLS = 46, ROWS = 24;
  let w = 0, h = 0, dpr = 1, running = false, raf = 0, t0 = performance.now();
  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const height = (x: number, z: number) => {
    const side = Math.pow(Math.abs(x) / (COLS / 2), 2.2);
    return (Math.sin(x * 0.45 + z * 0.3) * 0.5 + Math.sin(z * 0.17 - x * 0.2) * 0.8 + 1.2) * side * 3.2;
  };
  const stars = Array.from({ length: 40 }, () => [Math.random(), Math.random() * 0.45, Math.random() * 1.2 + 0.3]);

  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    const horizon = h * 0.6;
    // estrelas
    ctx.fillStyle = 'rgba(255,249,203,.7)';
    for (const [sx, sy, r] of stars) { ctx.beginPath(); ctx.arc(sx * w, sy * horizon, r, 0, Math.PI * 2); ctx.fill(); }
    // sol (gradiente oficial peach→pink)
    const grow = Math.min(1, 0.8 + t * 0.1);
    const sr = Math.min(w, h) * 0.22 * grow;
    const g = ctx.createLinearGradient(0, horizon - sr, 0, horizon);
    g.addColorStop(0, '#E9639B'); g.addColorStop(0.9, '#FEC497');
    ctx.save();
    ctx.shadowColor = 'rgba(233,99,155,.8)'; ctx.shadowBlur = 60;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(w / 2, horizon, sr, Math.PI, 0); ctx.fill();
    ctx.restore();
    // faixas do sol
    ctx.fillStyle = '#0C0D1B';
    for (let i = 0; i < 6; i++) { const y = horizon - sr * (0.08 + i * 0.12); ctx.fillRect(w / 2 - sr, y, sr * 2, 2 + i * 0.6); }
    // malha
    const speed = 1.4, scroll = (t * speed) % 1;
    const fov = h * 0.9, camY = 3.2;
    const proj = (x: number, y: number, z: number) => {
      const zz = z - scroll + 1.2;
      const s = fov / (zz * 4);
      return [w / 2 + x * s * 2.2, horizon + (camY - y) * s, zz] as const;
    };
    for (let r = ROWS - 1; r >= 0; r--) {
      const zA = r, zB = r + 1;
      const pts: Array<readonly [number, number, number]> = [];
      const ptsB: Array<readonly [number, number, number]> = [];
      for (let c = 0; c <= COLS; c++) {
        const x = c - COLS / 2;
        pts.push(proj(x, height(x, zA + Math.floor(t * speed)), zA));
        ptsB.push(proj(x, height(x, zB + Math.floor(t * speed)), zB));
      }
      const alpha = Math.max(0, 1 - r / ROWS) * 0.9;
      // preenche a faixa para que montes próximos escondam os distantes
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      for (let i = ptsB.length - 1; i >= 0; i--) ctx.lineTo(ptsB[i][0], ptsB[i][1]);
      ctx.closePath();
      ctx.fillStyle = '#0C0D1B'; ctx.fill();
      ctx.strokeStyle = `rgba(204,194,245,${alpha * 0.55})`; ctx.lineWidth = 1;
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      ctx.strokeStyle = `rgba(233,99,155,${alpha * 0.45})`;
      ctx.beginPath();
      for (let c = 0; c <= COLS; c += 2) { ctx.moveTo(pts[c][0], pts[c][1]); ctx.lineTo(ptsB[c][0], ptsB[c][1]); }
      ctx.stroke();
    }
    if (running) raf = requestAnimationFrame(draw);
  };
  resize();
  addEventListener('resize', resize, { passive: true });
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(draw); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(host);
}
