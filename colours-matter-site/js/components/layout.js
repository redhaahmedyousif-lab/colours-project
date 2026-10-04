import { $, $$, esc, icons } from '../lib/dom.js?v=muu3b8bv';
import { routes, site } from '../data/site.js?v=muu3b8bv';
import { journeyMarkup } from './journey.js?v=muu3b8bv';

const isDark = () => document.documentElement.classList.contains('dark');

function setTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  try {
    localStorage.setItem('cm-theme', dark ? 'dark' : 'light');
  } catch {}
  $$('[data-theme-toggle]').forEach(syncToggle);
}

function syncToggle(btn) {
  const dark = isDark();
  btn.innerHTML = dark ? icons.sun : icons.moon;
  btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  btn.setAttribute('aria-pressed', String(dark));
}

const brand = `
  <a href="#/" class="group flex items-center gap-2.5" aria-label="${esc(site.title)} home">
    <span class="relative grid size-9 place-items-center overflow-hidden rounded-xl shadow-sm">
      <span class="absolute inset-0 bg-[conic-gradient(from_200deg,#ce1126,#f59e0b,#0f766e,#2563eb,#9333ea,#ce1126)] transition duration-700 group-hover:rotate-180"></span>
      <span class="relative size-3.5 rounded-full bg-canvas"></span>
    </span>
    <span class="leading-tight">
      <span class="block font-display text-lg font-semibold">${esc(site.title)}</span>
      <span class="block text-[11px] font-medium tracking-wide text-ink-muted">${esc(site.tagline)}</span>
    </span>
  </a>`;

export function renderHeader() {
  const header = $('#site-header');
  header.className = 'sticky top-[env(safe-area-inset-top,0px)] z-40 bg-canvas/80 backdrop-blur-xl';
  header.innerHTML = `
    <nav class="container-page flex h-16 items-center justify-between gap-4" aria-label="Main">
      ${brand}
      <div class="hidden items-center gap-1 md:flex">
        ${routes.map((r) => `<a class="nav-link" href="#${r.path}" data-nav="${r.path}">${esc(r.label)}</a>`).join('')}
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="btn-ghost btn !p-2.5" data-theme-toggle></button>
        <button type="button" class="btn-ghost btn !p-2 md:hidden" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">${icons.menu}</button>
      </div>
    </nav>
    ${journeyMarkup()}
    <div id="mobile-menu" class="hidden border-t border-line md:hidden">
      <div class="container-page grid gap-1 py-3">
        ${routes.map((r) => `<a class="nav-link !rounded-xl !py-3" href="#${r.path}" data-nav="${r.path}">${esc(r.label)}</a>`).join('')}
      </div>
    </div>`;

  $$('[data-theme-toggle]', header).forEach((btn) => {
    syncToggle(btn);
    btn.addEventListener('click', () => setTheme(!isDark()));
  });

  const menuBtn = $('[data-menu-toggle]', header);
  const menu = $('#mobile-menu', header);
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden') === false;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.innerHTML = open ? icons.close : icons.menu;
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  // Follow the OS theme until the visitor picks one explicitly.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem('cm-theme');
    } catch {}
    if (!saved) {
      document.documentElement.classList.toggle('dark', e.matches);
      $$('[data-theme-toggle]').forEach(syncToggle);
    }
  });
}

export function setActiveNav(path) {
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === path) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  const menu = $('#mobile-menu');
  if (menu && !menu.classList.contains('hidden')) $('[data-menu-toggle]').click();
}

export function renderFooter() {
  const footer = $('#site-footer');
  footer.className = 'mt-24 border-t border-line bg-surface';
  footer.innerHTML = `
    <div class="h-1.5 w-full bg-[linear-gradient(90deg,#ce1126,#f59e0b,#0f766e,#2563eb,#9333ea)]"></div>
    <div class="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
      <div>
        ${brand}
        <p class="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
          An exploration of how colour shapes our culture, our appetite and the places we love in the Kingdom of Bahrain.
        </p>
      </div>
      <div>
        <p class="eyebrow">Projects</p>
        <ul class="mt-4 space-y-2 text-sm">
          ${routes
            .slice(1)
            .map((r) => `<li><a class="text-ink-soft hover:text-ink hover:underline" href="#${r.path}">${esc(r.label)}</a></li>`)
            .join('')}
        </ul>
      </div>
      <div>
        <p class="eyebrow">About</p>
        <ul class="mt-4 space-y-2 text-sm text-ink-soft">
          <li>${esc(site.subject)}</li>
          <li>${esc(site.unit)}</li>
          <li>${esc(site.school)}</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-line">
      <div class="container-page flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© ${site.year} ${esc(site.author)}. Made for learning.</p>
        <p>Colours used with care · Designed to be accessible in light &amp; dark mode</p>
      </div>
    </div>`;
}
