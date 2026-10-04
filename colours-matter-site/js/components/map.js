/**
 * Bahrain Colour Map: a simplified map of the islands with landmark pins.
 * Choosing a pin reveals that place's palette, story and emotional tone.
 * `focus` (a colour family) quietly highlights the places that share it.
 */
import { $, $$, esc, icons } from '../lib/dom.js?v=muu34gd2';
import { actions } from '../lib/app.js?v=muu34gd2';
import { families, family } from '../lib/palette.js?v=muu34gd2';
import { landmarks } from '../data/places.js?v=muu34gd2';
import { toast } from '../lib/ui.js?v=muu34gd2';

const MAIN =
  'M118 38 C138 30 170 34 192 40 C206 44 220 46 226 56 C236 70 234 92 230 108 C236 124 246 140 238 160 C230 178 224 200 216 230 C206 268 196 310 182 352 C174 378 166 404 158 424 C150 404 142 380 136 352 C126 304 112 260 104 216 C98 180 92 146 94 112 C96 80 102 50 118 38 Z';
const MUHARRAQ = 'M240 30 C252 22 272 22 280 30 C286 38 278 52 266 56 C254 58 242 52 238 44 C236 38 236 34 240 30 Z';

function pin(l, i) {
  const r = 11;
  const c = 2 * Math.PI * r;
  const seg = c / l.palette.length;
  const labelLeft = l.x > 240;
  return `
    <g class="map-pin" data-pin="${l.id}" role="button" tabindex="0" aria-label="${esc(l.name)}, ${esc(l.area)}" style="--d:${i * 70}ms">
      <circle cx="${l.x}" cy="${l.y}" r="16" fill="transparent"/>
      <g class="map-pin-ring">
        ${l.palette
          .map(
            (hex, j) =>
              `<circle cx="${l.x}" cy="${l.y}" r="${r}" fill="none" stroke="${hex}" stroke-width="5" stroke-dasharray="${seg - 1.2} ${c - seg + 1.2}" stroke-dashoffset="${-j * seg}" transform="rotate(-90 ${l.x} ${l.y})"/>`,
          )
          .join('')}
      </g>
      <circle class="map-pin-core" cx="${l.x}" cy="${l.y}" r="4.5"/>
      <text class="map-pin-label" x="${labelLeft ? l.x - 18 : l.x + 18}" y="${l.y + 4}" text-anchor="${labelLeft ? 'end' : 'start'}">${esc(l.name)}</text>
    </g>`;
}

function panel(l) {
  const link = l.post
    ? `<a href="#/blog?post=${l.post}" class="btn btn-ghost !py-2 text-sm" data-map-open="${l.post}">Read the story ${icons.arrow}</a>`
    : `<a href="${l.route}" class="btn btn-ghost !py-2 text-sm">See it in Project 1 ${icons.arrow}</a>`;
  return `
    <div class="animate-fade-up">
      <p class="eyebrow">${esc(l.area)}</p>
      <h3 class="mt-2 text-3xl font-semibold">${esc(l.name)}</h3>
      <div class="mt-5 flex h-20 overflow-hidden rounded-2xl ring-1 ring-black/5">
        ${l.palette
          .map(
            (hex) => `
          <button type="button" class="map-swatch group relative flex-1" style="background:${hex}" data-copy-hex="${hex}" aria-label="Copy ${hex.toUpperCase()}">
            <span class="map-hex">${hex.toUpperCase()}</span>
          </button>`,
          )
          .join('')}
      </div>
      <p class="mt-5 text-sm font-semibold text-ink">${esc(l.mood)}</p>
      <p class="mt-2 leading-relaxed text-ink-soft">${esc(l.story)}</p>
      <div class="mt-6">${link}</div>
    </div>`;
}

export function mountMap(el, { focus = null } = {}) {
  const focusSet = focus && families[focus] ? new Set(landmarks.filter((l) => l.palette.some((h) => family(h) === focus)).map((l) => l.id)) : null;
  const first = (focusSet && landmarks.find((l) => focusSet.has(l.id))) || landmarks[0];

  el.innerHTML = `
    <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div class="map-wrap relative">
        ${
          focusSet
            ? `<p class="mb-3 flex items-center gap-2 text-sm text-ink-muted" data-focus-note>
                <span class="size-3 rounded-full" style="background:${families[focus].sample}"></span>
                Places with ${esc(families[focus].label)}
                <button type="button" class="ml-1 underline underline-offset-2 hover:text-ink" data-clear-focus>show all</button>
              </p>`
            : ''
        }
        <svg viewBox="0 0 320 440" class="map-svg w-full max-w-md" role="group" aria-label="Simplified map of Bahrain with colourful landmarks">
          <rect width="320" height="440" rx="28" class="map-sea"/>
          <g class="map-waves" aria-hidden="true">
            ${Array.from({ length: 9 }, (_, i) => `<path d="M${20 + (i % 3) * 18} ${60 + i * 42} q8 -4 16 0" />`).join('')}
            ${Array.from({ length: 7 }, (_, i) => `<path d="M${262 + (i % 2) * 14} ${130 + i * 44} q8 -4 16 0" />`).join('')}
          </g>
          <path d="${MAIN}" class="map-land"/>
          <path d="${MUHARRAQ}" class="map-land"/>
          <ellipse cx="248" cy="142" rx="8" ry="14" class="map-land"/>
          <ellipse cx="70" cy="150" rx="12" ry="8" class="map-land"/>
          <ellipse cx="294" cy="22" rx="8" ry="2.6" class="map-sand"/>
          <text x="128" y="250" class="map-caption">BAHRAIN</text>
          ${landmarks.map(pin).join('')}
        </svg>
      </div>
      <div class="card min-h-[22rem] p-6 sm:p-8" data-map-panel aria-live="polite"></div>
    </div>`;

  const svg = $('svg', el);
  const panelEl = $('[data-map-panel]', el);
  const pins = $$('[data-pin]', el);

  const applyFocus = (set) => pins.forEach((p) => p.classList.toggle('is-dim', !!set && !set.has(p.dataset.pin)));

  const select = (id, { notice = true } = {}) => {
    const l = landmarks.find((x) => x.id === id);
    pins.forEach((p) => {
      const on = p.dataset.pin === id;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-pressed', String(on));
    });
    panelEl.innerHTML = panel(l);
    if (notice) actions.notice(l.palette, 0.6);
  };

  pins.forEach((p) => {
    p.addEventListener('click', () => select(p.dataset.pin));
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(p.dataset.pin);
      }
    });
  });

  panelEl.addEventListener('click', async (e) => {
    const sw = e.target.closest('[data-copy-hex]');
    if (!sw) return;
    try {
      await navigator.clipboard.writeText(sw.dataset.copyHex);
      toast(`Copied ${sw.dataset.copyHex.toUpperCase()}`);
    } catch {
      toast(sw.dataset.copyHex.toUpperCase());
    }
  });

  $('[data-clear-focus]', el)?.addEventListener('click', () => {
    applyFocus(null);
    $('[data-focus-note]', el)?.remove();
  });

  applyFocus(focusSet);
  select(first.id, { notice: false });
  svg.classList.add('is-ready');
}
