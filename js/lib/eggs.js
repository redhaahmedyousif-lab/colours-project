/**
 * Small surprises for curious visitors. None of them is announced.
 *
 *  - Click the logo five times quickly: the colour wheel spins and shows the
 *    colours you have noticed most on the site.
 *  - Type the Konami code (↑ ↑ ↓ ↓ ← → ← → B A): see the whole site without
 *    colour, the way a colour-free world would look. Type it again to return.
 *  - Developers who open the console get a short note.
 */
import { $ } from './dom.js?v=muu2qa3h';
import { toast } from './ui.js?v=muu2qa3h';
import { store } from './app.js?v=muu2qa3h';
import { families } from './palette.js?v=muu2qa3h';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function startEasterEggs() {
  console.log(
    '%cColours Matter%c\nEvery colour on this site was chosen on purpose. Curious? Try the Konami code.',
    'font: 600 20px Georgia, serif; color:#0f766e',
    'font: 13px system-ui; color:#9a5b34',
  );

  const logo = $('#site-header a[href="#/"]');
  let clicks = [];
  logo?.addEventListener('click', () => {
    const now = Date.now();
    clicks = [...clicks.filter((t) => now - t < 1600), now];
    if (clicks.length < 5) return;
    clicks = [];
    logo.classList.remove('egg-spin');
    void logo.offsetWidth;
    logo.classList.add('egg-spin');
    const top = Object.entries(store.get().seen)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([f]) => families[f]?.label ?? f);
    toast(top.length ? `The colours you noticed most: ${top.join(', ')}.` : 'You found the colour wheel.');
  });

  let pos = 0;
  addEventListener('keydown', (e) => {
    if (e.target.closest?.('input, textarea, select')) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
    if (pos < KONAMI.length) return;
    pos = 0;
    const on = document.documentElement.classList.toggle('no-colour');
    toast(on ? 'This is the site without colour. Notice what is missing.' : 'Colour is back.');
  });
}
