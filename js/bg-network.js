(function () {
  const canvas = document.getElementById('bg-network');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const styles = getComputedStyle(document.documentElement);
  const accent = (styles.getPropertyValue('--accent-color') || '#d93e05').trim();
  const muted = (styles.getPropertyValue('--text-light') || '#888888').trim();

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  const accentRgb = hexToRgb(accent);
  const mutedRgb = hexToRgb(muted);

  const LINK_DIST = 140;
  const SPEED = 0.28; // px / frame — visible mais discret
  const ACCENT_RATIO = 6; // 1 nœud sur 6 teinté accent

  let width, height, dpr;
  let nodes = [];
  let animId = null;
  let running = false;

  function nodeCountFor(w, h) {
    const area = w * h;
    const base = Math.round(area / 15000);
    const cap = w < 600 ? 45 : 90;
    return Math.max(24, Math.min(base, cap));
  }

  function seedNodes() {
    const count = nodeCountFor(width, height);
    nodes = new Array(count).fill(null).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: Math.random() * 1.4 + 1.2,
      accent: Math.random() < 1 / ACCENT_RATIO,
    }));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedNodes();
    draw();
  }

  function step() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x <= 0 || n.x >= width) n.vx *= -1;
      if (n.y <= 0 || n.y >= height) n.vy *= -1;
      n.x = Math.max(0, Math.min(width, n.x));
      n.y = Math.max(0, Math.min(height, n.y));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.18;
          ctx.strokeStyle = `rgba(${mutedRgb.r}, ${mutedRgb.g}, ${mutedRgb.b}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const n of nodes) {
      const rgb = n.accent ? accentRgb : mutedRgb;
      const alpha = n.accent ? 0.5 : 0.32;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
      ctx.fill();
    }
  }

  function loop() {
    if (!running) return;
    step();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function start() {
    if (prefersReducedMotion || animId) return;
    running = true;
    loop();
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150);
  });

  resize();
  start();
})();