/**
 * Scroll-driven story of the A'ali jar. As the visitor scrolls, the jar is
 * built layer by layer: Earth (the clay body) → Life (emerald bands) →
 * Heritage (kiln texture, stamped dots, the rim). Scroll position is mapped
 * to three CSS variables; the browser does the drawing.
 */
import { $, $$ } from '../lib/dom.js?v=muu366i1';
import { actions } from '../lib/app.js?v=muu366i1';
import { reducedMotion } from '../lib/motion.js?v=muu366i1';
import { JAR_SHAPE } from './jar.js?v=muu366i1';

const steps = [
  {
    key: 'Earth',
    title: 'It begins as earth.',
    text: 'Clay dug from Bahraini ground is shaped by hand on the wheel. Its brown is the colour of the land itself: stable, warm and safe.',
    colours: ['#9a5b34', '#c2693e'],
  },
  {
    key: 'Life',
    title: 'Then comes life.',
    text: 'Bands of emerald recall palm groves and fresh springs in a dry land. Green brings calm and hope to the earthy body.',
    colours: ['#0f766e'],
  },
  {
    key: 'Heritage',
    title: 'It becomes heritage.',
    text: 'Fired in the kiln and pressed with a rhythm of dots, the jar carries generations of A’ali craft. Earth and life together create balance.',
    colours: ['#5c3317', '#e9d8b8'],
  },
];

const hotspots = [
  { x: 64, y: 196, layer: 'earth', label: 'Clay body: local earth, darkened by the kiln' },
  { x: 150, y: 101, layer: 'life', label: 'Emerald band: water and palm groves' },
  { x: 100, y: 145, layer: 'heritage', label: 'Dot row: a rhythm pressed by hand' },
  { x: 128, y: 34, layer: 'heritage', label: 'Rim: where hands lift and pour' },
];

function jar() {
  return `
  <svg viewBox="0 0 200 270" class="story-jar" role="img" aria-label="An A'ali clay jar, built layer by layer">
    <defs>
      <clipPath id="story-clip"><path d="${JAR_SHAPE}"/></clipPath>
      <radialGradient id="story-light" cx="35%" cy="40%" r="70%">
        <stop offset="0" stop-color="#fff" stop-opacity=".28"/>
        <stop offset=".55" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity=".35"/>
      </radialGradient>
      <pattern id="story-kiln" width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="3" r=".8" fill="#2a160b"/><circle cx="7" cy="7" r=".6" fill="#f3d9b5"/><circle cx="6" cy="1.5" r=".5" fill="#2a160b"/>
      </pattern>
    </defs>
    <ellipse cx="100" cy="252" rx="58" ry="8" fill="#000" class="story-shadow"/>
    <g clip-path="url(#story-clip)">
      <rect width="200" height="270" fill="#9a5b34" class="story-clay"/>
      <rect width="200" height="270" fill="url(#story-kiln)" class="story-kiln"/>
      <g fill="#0f766e" class="story-bands">
        <rect x="0" y="96" width="200" height="12"/>
        <rect x="0" y="114" width="200" height="4"/>
        <path d="M0 176 q12.5 -12 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 v8 q-12.5 -12 -25 0 t-25 0 t-25 0 t-25 0 t-25 0 t-25 0 t-25 0 t-25 0 z"/>
        <rect x="0" y="198" width="200" height="4"/>
      </g>
      <g fill="#5c3317">
        ${[55, 70, 85, 100, 115, 130, 145].map((x, i) => `<circle cx="${x}" cy="145" r="3" class="story-dot" style="--i:${i}"/>`).join('')}
      </g>
      <rect width="200" height="270" fill="url(#story-light)" class="story-light"/>
    </g>
    <path d="${JAR_SHAPE}" pathLength="1" class="story-outline"/>
    <g class="story-rim">
      <ellipse cx="100" cy="34" rx="28" ry="6" fill="#5c3317"/>
      <ellipse cx="100" cy="34" rx="20" ry="3.5" fill="#000" opacity=".45"/>
    </g>
    ${hotspots
      .map(
        (h, i) => `
      <g class="story-hotspot" data-layer="${h.layer}" tabindex="0" role="note" aria-label="${h.label}">
        <circle cx="${h.x}" cy="${h.y}" r="14" fill="transparent"/>
        <circle cx="${h.x}" cy="${h.y}" r="5" class="story-hotspot-ring"/>
        <foreignObject x="${h.x > 110 ? h.x - 118 : h.x + 10}" y="${h.y - 30}" width="108" height="60" class="story-hotspot-label">
          <p xmlns="http://www.w3.org/1999/xhtml" style="text-align:${h.x > 110 ? 'right' : 'left'}"><span>${h.label}</span></p>
        </foreignObject>
      </g>`,
      )
      .join('')}
  </svg>`;
}

export function storyMarkup() {
  return `
  <section class="story" data-story aria-label="How the jar is made: earth, life, heritage">
    <div class="story-sticky container-page">
      <div class="story-stage">${jar()}</div>
      <div class="story-copy">
        <ol class="story-meter" aria-hidden="true">
          ${steps.map((s, i) => `<li style="--n:${i}"><span></span>${s.key}</li>`).join('')}
        </ol>
        <div class="story-steps">
          ${steps
            .map(
              (s, i) => `
            <article class="story-step" data-step="${i}">
              <p class="eyebrow">${String(i + 1).padStart(2, '0')} · ${s.key}</p>
              <h2 class="mt-3 text-4xl leading-tight font-semibold sm:text-5xl">${s.title}</h2>
              <p class="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">${s.text}</p>
            </article>`,
            )
            .join('')}
        </div>
      </div>
    </div>
  </section>`;
}

export function mountStory(root) {
  const section = $('[data-story]', root);
  const stepsEls = $$('[data-step]', section);
  const noticed = new Set();

  const setState = (earth, life, heritage) => {
    section.style.setProperty('--earth', earth.toFixed(3));
    section.style.setProperty('--life', life.toFixed(3));
    section.style.setProperty('--heritage', heritage.toFixed(3));
    const active = heritage > 0.02 ? 2 : life > 0.02 ? 1 : 0;
    stepsEls.forEach((el, i) => el.classList.toggle('is-active', i === active));
    section.dataset.active = active;
    if (!noticed.has(active) && (active > 0 || earth > 0.5)) {
      noticed.add(active);
      actions.notice(steps[active].colours, 0.5);
    }
  };

  if (reducedMotion()) {
    section.classList.add('is-static');
    setState(1, 1, 1);
    stepsEls.forEach((el) => el.classList.add('is-active'));
    return () => {};
  }

  const clamp = (v) => Math.min(1, Math.max(0, v));
  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - innerHeight;
    const p = total > 0 ? clamp(-rect.top / total) : 1;
    setState(clamp(p / 0.3), clamp((p - 0.33) / 0.27), clamp((p - 0.66) / 0.26));
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  update();
  return () => {
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
  };
}
