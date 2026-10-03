import { $, $$, esc, icons } from '../lib/dom.js';
import { toast } from '../lib/ui.js';
import { glazeJar, jarSvg } from '../components/jar.js';
import { pageHero } from '../components/sections.js';
import { glazes, palette, process, slides } from '../data/art.js';

export function renderArt(main) {
  main.innerHTML = `
    ${pageHero({
      number: 1,
      kicker: 'Art Presentation',
      title: "The colours of A'ali pottery",
      text: "A showcase of Bahrain’s best-known craft: the hand-thrown clay jar of A'ali. Discover its earthy palette of emerald green and warm brown, and the moods and meaning behind every shade.",
      accent: 'from-emerald-glaze/30 via-clay-light/25 to-transparent',
    })}
    ${showcase()}
    ${about()}
    ${paletteSection()}
    ${presentation()}
    ${reflection()}
  `;

  wireGlazes(main);
  wireCopy(main);
  return wirePresentation(main);
}

function showcase() {
  const first = glazes[0];
  return `
  <section class="container-page" aria-labelledby="showcase-title">
    <div class="card reveal overflow-hidden">
      <div class="grid lg:grid-cols-2">
        <div class="relative grid min-h-[26rem] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,var(--cm-surface),var(--cm-surface-2))] p-8">
          <div aria-hidden="true" class="absolute inset-x-10 bottom-10 h-16 rounded-[100%] bg-clay/20 blur-2xl"></div>
          <div data-jar class="relative w-56 sm:w-64">${jarSvg({ ...first, className: 'w-full drop-shadow-2xl', label: "Illustration of a traditional A'ali clay jar" })}</div>
        </div>
        <div class="p-7 sm:p-10">
          <p class="eyebrow">Showcase · try it</p>
          <h2 id="showcase-title" class="mt-3 text-3xl font-semibold sm:text-4xl">Re-glaze the jar</h2>
          <p class="mt-3 text-ink-soft">The same shape can feel completely different depending on its colour. Pick a glaze and notice how your feelings about the jar change.</p>
          <div class="mt-7 flex flex-wrap gap-2" role="radiogroup" aria-label="Glaze colour">
            ${glazes
              .map(
                (g, i) => `
              <button type="button" role="radio" aria-checked="${i === 0}" data-glaze="${g.id}"
                class="group flex items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5 text-sm font-medium transition hover:bg-surface-2 aria-checked:border-ink aria-checked:bg-ink aria-checked:text-canvas">
                <span class="flex overflow-hidden rounded-full ring-1 ring-black/10">
                  <span class="size-5" style="background:${g.body}"></span><span class="size-5" style="background:${g.band}"></span>
                </span>
                ${g.name}
              </button>`,
              )
              .join('')}
          </div>
          <div class="mt-7 rounded-2xl border border-line bg-surface-2 p-5">
            <p class="eyebrow">Mood</p>
            <p data-glaze-mood class="mt-2 font-display text-xl leading-snug">${first.mood}</p>
          </div>
          <dl class="mt-7 grid grid-cols-3 gap-4 text-sm">
            <div><dt class="text-ink-muted">Origin</dt><dd class="mt-1 font-semibold">A'ali, Bahrain</dd></div>
            <div><dt class="text-ink-muted">Material</dt><dd class="mt-1 font-semibold">Local clay</dd></div>
            <div><dt class="text-ink-muted">Made by</dt><dd class="mt-1 font-semibold">Hand &amp; wheel</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </section>`;
}

function wireGlazes(main) {
  const svg = $('[data-jar] svg', main);
  const mood = $('[data-glaze-mood]', main);
  const buttons = $$('[data-glaze]', main);
  const pick = (btn, focus) => {
    const g = glazes.find((x) => x.id === btn.dataset.glaze);
    buttons.forEach((b) => {
      b.setAttribute('aria-checked', String(b === btn));
      b.tabIndex = b === btn ? 0 : -1;
    });
    if (focus) btn.focus();
    glazeJar(svg, g);
    mood.textContent = g.mood;
  };
  buttons.forEach((b, i) => {
    b.tabIndex = i === 0 ? 0 : -1;
    b.addEventListener('click', () => pick(b));
    b.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      pick(buttons[(i + dir + buttons.length) % buttons.length], true);
    });
  });
}

function about() {
  return `
  <section class="container-page py-20" aria-labelledby="about-title">
    <div class="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div class="reveal">
        <p class="eyebrow">Cultural context</p>
        <h2 id="about-title" class="mt-3 text-4xl font-semibold">A village shaped by clay</h2>
        <div class="prose-cm mt-5">
          <p>A'ali is a village in the centre of Bahrain that has been known for pottery for generations. Families of potters work in small workshops and traditional kilns, turning local clay into jars, bowls, incense burners and decorative pieces.</p>
          <p>The village is also home to some of the famous ancient burial mounds of the Dilmun civilisation, part of a UNESCO World Heritage Site. Making pottery here connects today’s craftspeople with thousands of years of history.</p>
          <p>Clay jars were traditionally used to store water and keep it cool, as well as food such as dates. Their colours were not chosen at random: they came straight from the earth and the fire.</p>
        </div>
      </div>
      <ol class="reveal relative grid gap-4">
        ${process
          .map(
            (p, i) => `
          <li class="card flex gap-5 p-5">
            <span class="grid size-11 shrink-0 place-items-center rounded-2xl font-display text-lg font-semibold text-white"
              style="background:${['#6b3b1f', '#9a5b34', '#c98b5e', '#c2693e', '#0f766e'][i]}">${i + 1}</span>
            <div>
              <h3 class="text-lg font-semibold">${p.step}</h3>
              <p class="mt-1 text-sm leading-relaxed text-ink-soft">${p.text}</p>
            </div>
          </li>`,
          )
          .join('')}
      </ol>
    </div>
  </section>`;
}

function paletteSection() {
  return `
  <section class="container-page" aria-labelledby="palette-title">
    <div class="reveal max-w-2xl">
      <p class="eyebrow">The palette</p>
      <h2 id="palette-title" class="mt-3 text-4xl font-semibold">Earthy colours &amp; their meaning</h2>
      <p class="mt-4 text-ink-soft">Each colour on the jar sends a message. Click a hex code to copy it. The mood profiles show how strongly I feel each colour expresses calm, warmth and energy.</p>
    </div>
    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      ${palette
        .map(
          (c, i) => `
        <article class="card reveal flex flex-col overflow-hidden" style="transition-delay:${i * 70}ms">
          <div class="h-32" style="background:${c.hex}"></div>
          <div class="flex flex-1 flex-col p-6">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-xl font-semibold">${c.name}</h3>
                <p class="text-xs text-ink-muted">${c.role}</p>
              </div>
              <button type="button" data-copy="${c.hex}" class="rounded-lg bg-surface-2 px-2 py-1 font-mono text-xs text-ink-soft transition hover:text-ink" aria-label="Copy ${c.name} hex code ${c.hex}">${c.hex.toUpperCase()}</button>
            </div>
            <div class="mt-4 flex flex-wrap gap-1.5">${c.mood.map((m) => `<span class="chip">${m}</span>`).join('')}</div>
            <p class="mt-4 flex-1 text-sm leading-relaxed text-ink-soft">${c.meaning}</p>
            <dl class="mt-5 space-y-2.5">
              ${Object.entries(c.profile)
                .map(
                  ([k, v]) => `
                <div class="grid grid-cols-[4rem_1fr_2.5rem] items-center gap-2 text-xs">
                  <dt class="text-ink-muted">${k}</dt>
                  <dd class="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                    <span class="block h-full rounded-full" style="width:${v}%;background:${c.hex}"></span>
                  </dd>
                  <dd class="text-right font-medium tabular-nums">${v}%</dd>
                </div>`,
                )
                .join('')}
            </dl>
          </div>
        </article>`,
        )
        .join('')}
    </div>

    <div class="reveal mt-8 grid overflow-hidden rounded-3xl text-white md:grid-cols-2">
      <div class="bg-clay p-8 sm:p-10">
        <p class="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">Warm brown says</p>
        <p class="mt-3 font-display text-2xl leading-snug">“I come from this land. I am solid, patient and safe.”</p>
      </div>
      <div class="bg-emerald-glaze p-8 sm:p-10">
        <p class="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">Emerald green says</p>
        <p class="mt-3 font-display text-2xl leading-snug">“I bring life, faith and hope — water in the desert.”</p>
      </div>
    </div>
  </section>`;
}

function wireCopy(main) {
  $$('[data-copy]', main).forEach((btn) =>
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        toast(`Copied ${btn.dataset.copy.toUpperCase()}`);
      } catch {
        toast(btn.dataset.copy.toUpperCase());
      }
    }),
  );
}

function slideVisual(visual) {
  if (visual === 'jar') return jarSvg({ className: 'h-full max-h-72 drop-shadow-2xl' });
  if (visual === 'pair')
    return `<div class="flex gap-4">${['#9a5b34', '#0f766e']
      .map((c) => `<span class="size-28 rounded-3xl shadow-2xl ring-4 ring-white/30 sm:size-36" style="background:${c}"></span>`)
      .join('')}</div>`;
  const hex = visual.split(':')[1];
  return `<div class="grid size-40 place-items-center rounded-full shadow-2xl ring-8 ring-white/20 sm:size-52" style="background:${hex}">
    <span class="font-mono text-sm text-white/85">${hex.toUpperCase()}</span></div>`;
}

function presentation() {
  return `
  <section class="container-page py-20" aria-labelledby="deck-title">
    <div class="reveal flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="eyebrow">Presentation mode</p>
        <h2 id="deck-title" class="mt-3 text-4xl font-semibold">Present the artwork</h2>
        <p class="mt-3 max-w-xl text-ink-soft">Use the arrow keys or buttons to move through the slides. Go full screen to present in class.</p>
      </div>
      <button type="button" class="btn btn-ghost self-start sm:self-auto" data-fullscreen>${icons.expand} Full screen</button>
    </div>

    <div data-deck class="reveal mt-8 overflow-hidden rounded-[2rem] bg-black shadow-2xl ring-1 ring-line" tabindex="0"
      role="region" aria-roledescription="carousel" aria-label="Art presentation slides">
      <div class="relative aspect-[4/5] sm:aspect-[16/9]">
        ${slides
          .map(
            (s, i) => `
          <div data-slide="${i}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}"
            class="absolute inset-0 grid items-center gap-6 p-8 text-white transition-opacity duration-500 sm:grid-cols-[1.1fr_0.9fr] sm:p-14 ${i === 0 ? '' : 'pointer-events-none opacity-0'}"
            style="background:${s.theme}" ${i === 0 ? '' : 'aria-hidden="true"'}>
            <div>
              <p class="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">${esc(s.kicker)}</p>
              <h3 class="mt-3 text-3xl leading-tight font-semibold sm:text-5xl">${esc(s.title)}</h3>
              <p class="mt-4 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">${esc(s.body)}</p>
            </div>
            <div class="flex h-40 items-center justify-center sm:h-full">${slideVisual(s.visual)}</div>
          </div>`,
          )
          .join('')}
      </div>
      <div class="flex items-center justify-between gap-4 bg-black/90 px-5 py-3 text-white">
        <button type="button" data-prev class="rounded-full p-2 transition hover:bg-white/10 disabled:opacity-30" aria-label="Previous slide">${icons.arrowLeft}</button>
        <div class="flex items-center gap-2" data-dots>
          ${slides.map((_, i) => `<button type="button" data-dot="${i}" class="h-2 w-2 rounded-full bg-white/30 transition-all aria-current:w-6 aria-current:bg-white" aria-label="Go to slide ${i + 1}"></button>`).join('')}
        </div>
        <button type="button" data-next class="rounded-full p-2 transition hover:bg-white/10 disabled:opacity-30" aria-label="Next slide">${icons.arrow}</button>
      </div>
    </div>
    <p class="sr-only" aria-live="polite" data-deck-status></p>
  </section>`;
}

function wirePresentation(main) {
  const deck = $('[data-deck]', main);
  const slideEls = $$('[data-slide]', deck);
  const dots = $$('[data-dot]', deck);
  const prev = $('[data-prev]', deck);
  const next = $('[data-next]', deck);
  const status = $('[data-deck-status]', main);
  let index = 0;

  const show = (i) => {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slideEls.forEach((el, n) => {
      const on = n === index;
      el.classList.toggle('opacity-0', !on);
      el.classList.toggle('pointer-events-none', !on);
      if (on) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((d, n) => {
      if (n === index) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    status.textContent = `Slide ${index + 1} of ${slides.length}: ${slides[index].title}`;
  };

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dots.forEach((d) => d.addEventListener('click', () => show(Number(d.dataset.dot))));

  const onKey = (e) => {
    const inDeck = deck.contains(document.activeElement) || document.fullscreenElement === deck;
    if (!inDeck) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      show(index + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      show(index - 1);
    } else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
  };
  document.addEventListener('keydown', onKey);

  // Swipe support on touch screens.
  let startX = null;
  deck.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  deck.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  const fsBtn = $('[data-fullscreen]', main);
  if (!document.fullscreenEnabled) fsBtn.hidden = true;
  fsBtn.addEventListener('click', () => {
    deck.requestFullscreen?.().then(() => deck.focus()).catch(() => toast('Full screen is not available here'));
  });

  show(0);
  return () => {
    document.removeEventListener('keydown', onKey);
    if (document.fullscreenElement) document.exitFullscreen();
  };
}

function reflection() {
  const questions = [
    ['How does colour communicate culture?', 'The browns and greens of the jar tell us where it comes from before anyone explains it. Colour is a language everyone in a community understands.'],
    ['How do colours affect our mood?', 'Brown makes me feel calm and safe, while green feels fresh and hopeful. Together they create a balanced, peaceful feeling.'],
    ['How can colour make an impact?', 'By choosing traditional colours in art and design, we help keep our heritage alive and share it with the world.'],
  ];
  return `
  <section class="container-page" aria-labelledby="reflect-title">
    <div class="reveal card p-7 sm:p-10">
      <p class="eyebrow">Reflection</p>
      <h2 id="reflect-title" class="mt-3 text-3xl font-semibold">What I learned</h2>
      <div class="mt-8 grid gap-6 md:grid-cols-3">
        ${questions
          .map(
            ([q, a]) => `
          <div class="border-l-2 border-emerald-glaze pl-5">
            <h3 class="font-sans text-base font-semibold">${q}</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">${a}</p>
          </div>`,
          )
          .join('')}
      </div>
      <div class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p class="text-sm text-ink-muted">Next: does colour change how food tastes?</p>
        <a href="#/taste" class="btn btn-primary">Project 2 · Colour &amp; Taste ${icons.arrow}</a>
      </div>
    </div>
  </section>`;
}
