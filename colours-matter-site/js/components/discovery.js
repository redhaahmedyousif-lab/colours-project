/**
 * Smart next discovery. At the end of each chapter, suggest where to go next
 * based on the colours the visitor has paid attention to, falling back to the
 * next chapter of the colour journey.
 */
import { esc, icons } from '../lib/dom.js?v=muu1oee4';
import { favouriteFamily, store } from '../lib/app.js?v=muu1oee4';
import { families } from '../lib/palette.js?v=muu1oee4';
import { landmarks } from '../data/places.js?v=muu1oee4';
import { chapters, nextChapter } from './journey.js?v=muu1oee4';
import { family } from '../lib/palette.js?v=muu1oee4';

function suggestion(from) {
  const fav = favouriteFamily();
  const next = nextChapter(from) ?? chapters[0];
  if (fav) {
    const name = families[fav].label;
    const where = landmarks.filter((l) => l.palette.some((h) => family(h) === fav));
    if (from !== '/blog' && where.length) {
      return {
        colour: families[fav].sample,
        lead: `You kept coming back to ${name}.`,
        text: `See where ${name} appears across Bahrain`,
        href: `#/blog?focus=${fav}`,
        alt: next,
      };
    }
    if (from === '/blog') {
      return {
        colour: families[fav].sample,
        lead: `${name[0].toUpperCase()}${name.slice(1)} stayed with you.`,
        text: `Find out whether ${name} can change how food tastes`,
        href: '#/taste',
        alt: null,
      };
    }
  }
  return { colour: next.colours[1], lead: `Next chapter: ${next.label}.`, text: next.id === 'culture' ? 'Begin with the clay of A’ali' : next.id === 'place' ? 'Walk through Bahrain’s colourful places' : 'Test whether colour changes taste', href: `#${next.path}`, alt: null };
}

/** Render into `el`; re-renders as the visitor notices more colours. */
export function mountDiscovery(el, from) {
  const render = () => {
    const s = suggestion(from);
    el.innerHTML = `
      <a href="${s.href}" class="discovery group">
        <span class="discovery-swatch" style="background:${s.colour}"></span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm text-ink-muted">${esc(s.lead)}</span>
          <span class="mt-0.5 block font-display text-xl font-semibold text-ink sm:text-2xl">${esc(s.text)}</span>
        </span>
        <span class="discovery-arrow">${icons.arrow}</span>
      </a>
      ${
        s.alt
          ? `<a href="#${s.alt.path}" class="mt-3 inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink">or continue the journey: ${esc(s.alt.label)} ${icons.arrow}</a>`
          : ''
      }`;
  };
  return store.subscribe((st) => st.seen, render);
}
