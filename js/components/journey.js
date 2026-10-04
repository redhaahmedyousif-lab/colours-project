/**
 * Colour Journey: a hairline under the header that carries the visitor from
 * Culture (A'ali clay and glaze) to Place (Bahrain at night) to Perception
 * (colour and taste). It fills as you read; hovering or focusing it reveals
 * the three chapters.
 */
import { $, esc } from '../lib/dom.js?v=muu3b8bv';

export const chapters = [
  { id: 'culture', path: '/art', label: 'Culture', project: 'Project 1', colours: ['#9a5b34', '#0f766e'] },
  { id: 'place', path: '/blog', label: 'Place', project: 'Project 3', colours: ['#1e1b4b', '#fbbf24'] },
  { id: 'perception', path: '/taste', label: 'Perception', project: 'Project 2', colours: ['#2563eb', '#f97316'] },
];

const gradient = `linear-gradient(90deg, ${chapters
  .flatMap((c, i) => c.colours.map((col, j) => `${col} ${((i * 2 + j) / 5) * 100}%`))
  .join(', ')})`;

export function journeyMarkup() {
  return `
  <nav data-journey aria-label="Colour journey" class="journey group relative">
    <div class="journey-track" aria-hidden="true">
      <div class="journey-fill" data-journey-fill style="background:${gradient}"></div>
    </div>
    <ol class="journey-stops">
      ${chapters
        .map(
          (c, i) => `
        <li><a href="#${c.path}" data-stop="${c.id}">
          <span class="journey-dot" style="background:linear-gradient(135deg,${c.colours.join(',')})"></span>
          <span>${i + 1}. ${esc(c.label)}</span><span class="journey-sub">${esc(c.project)}</span>
        </a></li>`,
        )
        .join('')}
    </ol>
  </nav>`;
}

/** Keep the fill in step with the current chapter and scroll position. */
export function startJourney() {
  const nav = $('[data-journey]');
  const fill = $('[data-journey-fill]', nav);
  let chapter = -1;
  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const f = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1;
    const progress = chapter < 0 ? f * 0.06 : (chapter + f) / chapters.length;
    fill.style.transform = `scaleX(${progress.toFixed(4)})`;
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  return {
    setPath(path) {
      chapter = chapters.findIndex((c) => c.path === path);
      nav.querySelectorAll('[data-stop]').forEach((a, i) => {
        a.toggleAttribute('data-current', i === chapter);
        a.toggleAttribute('data-done', chapter >= 0 && i < chapter);
        if (i === chapter) a.setAttribute('aria-current', 'step');
        else a.removeAttribute('aria-current');
      });
      update();
    },
  };
}

/** Next chapter after `path` in journey order (or the first one from Home). */
export function nextChapter(path) {
  const i = chapters.findIndex((c) => c.path === path);
  return chapters[i + 1] ?? null;
}
