/**
 * Quiet motion helpers. Everything respects prefers-reduced-motion by
 * jumping straight to the final state.
 */
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Run `fn(el)` once when `el` scrolls into view. Returns a disconnect function. */
export function onVisible(el, fn, { threshold = 0.25 } = {}) {
  if (!('IntersectionObserver' in window)) {
    fn(el);
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          io.unobserve(e.target);
          fn(e.target);
        }
      });
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}

const ease = (t) => 1 - (1 - t) ** 3;

function tween(duration, step) {
  const start = performance.now();
  const frame = (now) => {
    const t = Math.min(1, (now - start) / duration);
    step(ease(t));
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/**
 * Living statistics: numbers marked `data-count-to` count up from zero and
 * bars marked `data-grow-to` (a percentage) grow, the first time they enter
 * the viewport. Markup already holds the final values, so the page reads
 * correctly without JavaScript.
 */
export function animateStats(root) {
  const stops = [];
  root.querySelectorAll('[data-count-to]').forEach((el) => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const to = Number(el.dataset.countTo);
    const decimals = Number(el.dataset.decimals ?? 0);
    const prefix = el.dataset.prefix ?? '';
    const suffix = el.dataset.suffix ?? '';
    const fmt = (v) => `${prefix}${v.toFixed(decimals)}${suffix}`;
    if (reducedMotion()) return;
    el.textContent = fmt(0);
    stops.push(onVisible(el, () => tween(1100, (p) => (el.textContent = fmt(to * p)))));
  });
  root.querySelectorAll('[data-grow-to]').forEach((el) => {
    if (el.dataset.grown) return;
    el.dataset.grown = '1';
    if (reducedMotion()) return;
    const to = el.dataset.growTo;
    el.style.width = '0%';
    stops.push(
      onVisible(el, () =>
        requestAnimationFrame(() => {
          el.style.transition = 'width 1.1s cubic-bezier(.2,.7,.2,1)';
          el.style.width = `${to}%`;
        }),
      ),
    );
  });
  return () => stops.forEach((s) => s());
}
