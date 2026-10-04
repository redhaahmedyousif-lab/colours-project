import { $, esc, icons } from './dom.js?v=muu1oee4';

/** Show a short, self-dismissing status message. */
export function toast(message) {
  const root = $('#toast-root');
  const el = document.createElement('div');
  el.className =
    'pointer-events-auto rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas shadow-xl animate-fade-up';
  el.textContent = message;
  root.replaceChildren(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

let lastFocus = null;
let activeClose = null;

/** Close whichever modal is open (used when the route changes). */
export function closeActiveModal() {
  activeClose?.();
}

/**
 * Open an accessible modal dialog. `render(body)` fills the panel and may
 * return a cleanup function. Returns a `close()` function.
 */
export function openModal({ title, render, wide = false }) {
  activeClose?.();
  const root = $('#modal-root');
  lastFocus = document.activeElement;
  root.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-6" data-backdrop>
      <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
        class="card relative max-h-[92vh] w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} overflow-y-auto rounded-b-none animate-fade-up sm:rounded-b-3xl">
        <div class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface/90 px-5 py-4 backdrop-blur sm:px-7">
          <h2 id="modal-title" class="text-xl font-semibold">${esc(title)}</h2>
          <button type="button" class="btn-ghost btn !p-2" data-close aria-label="Close dialog">${icons.close}</button>
        </div>
        <div data-body class="px-5 py-6 sm:px-7"></div>
      </div>
    </div>`;
  document.body.style.overflow = 'hidden';
  const body = $('[data-body]', root);
  const cleanup = render(body);

  const onKey = (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocus(e, root);
  };
  function close() {
    if (activeClose !== close) return;
    activeClose = null;
    document.removeEventListener('keydown', onKey);
    if (typeof cleanup === 'function') cleanup();
    root.innerHTML = '';
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  }
  activeClose = close;
  document.addEventListener('keydown', onKey);
  root.querySelector('[data-close]').addEventListener('click', close);
  root.querySelector('[data-backdrop]').addEventListener('mousedown', (e) => {
    if (e.target.matches('[data-backdrop]')) close();
  });
  root.querySelector('[data-close]').focus();
  return close;
}

export function trapFocus(e, root) {
  const focusable = [
    ...root.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'),
  ].filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
