/**
 * confetti.js — Lightweight pure JavaScript confetti celebration.
 * Zero dependencies, high performance, self-cleaning.
 */

const COLORS = ['#1a5632', '#2d8a56', '#b5383a', '#d4a054', '#f5f0e8', '#3b82f6'];

/**
 * Trigger a confetti burst on the screen.
 * @param {number} [particleCount=50]
 */
export function fireConfetti(particleCount = 50) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '9999';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const el = document.createElement('div');
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const size = Math.floor(Math.random() * 8) + 6;

    el.style.position = 'absolute';
    el.style.width = `${size}px`;
    el.style.height = `${size * 1.4}px`;
    el.style.backgroundColor = color;
    el.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
    el.style.left = `${window.innerWidth / 2}px`;
    el.style.top = `${window.innerHeight / 2 - 50}px`;
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%)';

    container.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 12 + 6;
    particles.push({
      el,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 50,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 4,
      rotX: Math.random() * 360,
      rotY: Math.random() * 360,
      rotSpeedX: (Math.random() - 0.5) * 15,
      rotSpeedY: (Math.random() - 0.5) * 15,
      gravity: 0.35,
      opacity: 1,
    });
  }

  let startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotX += p.rotSpeedX;
      p.rotY += p.rotSpeedY;

      if (elapsed > 1500) {
        p.opacity = Math.max(0, 1 - (elapsed - 1500) / 1000);
      }

      if (p.opacity > 0 && p.y < window.innerHeight + 50) {
        alive = true;
        p.el.style.transform = `translate(${p.x - window.innerWidth / 2}px, ${p.y - (window.innerHeight / 2 - 50)}px) rotateX(${p.rotX}deg) rotateY(${p.rotY}deg)`;
        p.el.style.opacity = p.opacity;
      } else {
        p.el.style.display = 'none';
      }
    }

    if (alive && elapsed < 3000) {
      requestAnimationFrame(animate);
    } else {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  }

  requestAnimationFrame(animate);
}
