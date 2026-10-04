import { $, observeReveals } from './lib/dom.js?v=muu366i1';
import { closeActiveModal } from './lib/ui.js?v=muu366i1';
import { renderFooter, renderHeader, setActiveNav } from './components/layout.js?v=muu366i1';
import { startJourney } from './components/journey.js?v=muu366i1';
import { routes, site } from './data/site.js?v=muu366i1';
import { startEasterEggs } from './lib/eggs.js?v=muu366i1';
import { backend, diagnose } from './lib/backend.js?v=muu366i1';

// Each page is its own module, fetched the first time it is visited.
const pages = {
  '/': () => import('./pages/home.js?v=muu366i1').then((m) => m.renderHome),
  '/art': () => import('./pages/art.js?v=muu366i1').then((m) => m.renderArt),
  '/taste': () => import('./pages/taste.js?v=muu366i1').then((m) => m.renderTaste),
  '/blog': () => import('./pages/blog.js?v=muu366i1').then((m) => m.renderBlog),
};

let cleanup = null;
let firstRender = true;
let navigation = 0;
let journey;

function currentPath() {
  const hash = location.hash;
  if (!hash.startsWith('#/')) return '/';
  const path = hash.slice(1).split('?')[0].replace(/\/+$/, '') || '/';
  return pages[path] ? path : '/';
}

async function navigate() {
  const hash = location.hash;
  // Plain in-page anchors (e.g. "#main") are not routes.
  if (hash && !hash.startsWith('#/')) return;

  const path = currentPath();
  const ticket = ++navigation;
  const render = await pages[path]();
  if (ticket !== navigation) return; // a newer navigation won

  const main = $('#main');
  closeActiveModal();
  if (typeof cleanup === 'function') cleanup();
  main.innerHTML = '';
  cleanup = render(main);

  const route = routes.find((r) => r.path === path);
  document.title = path === '/' ? `${site.title} — ${site.tagline}` : `${route.label} — ${site.title}`;
  setActiveNav(path);
  journey.setPath(path);
  window.scrollTo({ top: 0, behavior: 'instant' });
  observeReveals(main);
  // Move focus to the new page for keyboard and screen-reader users.
  if (!firstRender) main.focus({ preventScroll: true });
  firstRender = false;
}

renderHeader();
renderFooter();
journey = startJourney();
startEasterEggs();

// Keep the skip link working alongside hash routing.
document.querySelector('.skip-link').addEventListener('click', (e) => {
  e.preventDefault();
  $('#main').focus();
});

window.addEventListener('hashchange', navigate);
navigate();
if (backend.mode === 'supabase') diagnose();
