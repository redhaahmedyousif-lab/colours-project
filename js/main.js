import { $, observeReveals } from './lib/dom.js';
import { closeActiveModal } from './lib/ui.js';
import { renderFooter, renderHeader, setActiveNav } from './components/layout.js';
import { routes, site } from './data/site.js';
import { renderHome } from './pages/home.js';
import { renderArt } from './pages/art.js';
import { renderTaste } from './pages/taste.js';
import { renderBlog } from './pages/blog.js';

const pages = {
  '/': renderHome,
  '/art': renderArt,
  '/taste': renderTaste,
  '/blog': renderBlog,
};

let cleanup = null;
let firstRender = true;

function currentPath() {
  const hash = location.hash;
  if (!hash.startsWith('#/')) return '/';
  const path = hash.slice(1).split('?')[0].replace(/\/+$/, '') || '/';
  return pages[path] ? path : '/';
}

function navigate() {
  const hash = location.hash;
  // Plain in-page anchors (e.g. "#main") are not routes.
  if (hash && !hash.startsWith('#/')) return;

  const path = currentPath();
  const main = $('#main');
  closeActiveModal();
  if (typeof cleanup === 'function') cleanup();
  main.innerHTML = '';
  cleanup = pages[path](main);

  const route = routes.find((r) => r.path === path);
  document.title = path === '/' ? `${site.title} — ${site.tagline}` : `${route.label} — ${site.title}`;
  setActiveNav(path);
  window.scrollTo({ top: 0, behavior: 'instant' });
  observeReveals(main);
  // Move focus to the new page for keyboard and screen-reader users.
  if (!firstRender) main.focus({ preventScroll: true });
  firstRender = false;
}

renderHeader();
renderFooter();

// Keep the skip link working alongside hash routing.
document.querySelector('.skip-link').addEventListener('click', (e) => {
  e.preventDefault();
  $('#main').focus();
});

window.addEventListener('hashchange', navigate);
navigate();
