import { $, $$, esc, icons } from '../lib/dom.js?v=muu1oee4';
import { toast, trapFocus } from '../lib/ui.js?v=muu1oee4';
import { colourMeanings, pillars, projects } from '../data/home.js?v=muu1oee4';
import { site } from '../data/site.js?v=muu1oee4';
import { actions } from '../lib/app.js?v=muu1oee4';
import { animateStats } from '../lib/motion.js?v=muu1oee4';
import { mountDiscovery } from '../components/discovery.js?v=muu1oee4';

export function renderHome(main) {
  main.innerHTML = `
    ${previewBanner()}
    ${hero()}
    ${overview()}
    ${explorer()}
    <div class="cv-auto">${projectCards()}</div>
    <section class="container-page pb-16"><div data-discovery></div></section>
    <div class="cv-auto">${quote()}</div>
  `;

  $('[data-scroll="projects"]', main).addEventListener('click', () =>
    $('#projects', main).scrollIntoView({ behavior: 'smooth' }),
  );
  $('[data-scroll="overview"]', main).addEventListener('click', () =>
    $('#overview', main).scrollIntoView({ behavior: 'smooth' }),
  );
  wireExplorer(main);
  const stops = [animateStats(main), mountDiscovery($('[data-discovery]', main), '/'), showNotice() ?? (() => {})];
  return () => stops.forEach((s) => s());
}

function hero() {
  return `
  <section class="relative isolate overflow-hidden">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-24 -left-20 size-[26rem] rounded-full bg-[#ce1126]/25 blur-3xl animate-float dark:bg-[#ce1126]/20"></div>
      <div class="absolute top-10 right-[-6rem] size-[30rem] rounded-full bg-emerald-glaze/30 blur-3xl animate-float [animation-delay:-3s]"></div>
      <div class="absolute bottom-[-10rem] left-1/3 size-[28rem] rounded-full bg-clay-light/35 blur-3xl animate-float [animation-delay:-6s]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--cm-line)_1px,transparent_0)] [background-size:28px_28px] opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
    </div>

    <div class="container-page grid items-center gap-14 pt-16 pb-20 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:pb-28">
      <div class="animate-fade-up">
        <p class="chip !bg-surface/70 backdrop-blur">
          <span class="size-2 rounded-full bg-emerald-glaze"></span>
          ${esc(site.subject)}
        </p>
        <h1 class="mt-6 text-5xl leading-[1.02] font-semibold sm:text-6xl lg:text-7xl">
          Colours Matter
          <span class="mt-2 block text-spectrum">Make an Impact.</span>
        </h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          From the clay of A'ali to the spice stalls of Manama Souq, colour tells
          the story of who we are. Three projects explore how colour carries culture,
          changes what we taste, and shapes how places make us feel.
        </p>
        <div class="mt-9 flex flex-wrap gap-3">
          <button type="button" class="btn btn-primary" data-scroll="projects">Explore the projects ${icons.arrow}</button>
          <button type="button" class="btn btn-ghost" data-scroll="overview">Why colour matters</button>
        </div>
        <dl class="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
          ${[
            [3, '', 'Projects'],
            [5, '', 'Foods recoloured'],
            [8, '+', 'Places in Bahrain'],
          ]
            .map(
              ([n, suffix, l]) => `
            <div>
              <dt class="sr-only">${l}</dt>
              <dd class="font-display text-3xl font-semibold tabular-nums" data-count-to="${n}" data-suffix="${suffix}">${n}${suffix}</dd>
              <dd class="mt-1 text-xs text-ink-muted">${l}</dd>
            </div>`,
            )
            .join('')}
        </dl>
      </div>

      <div class="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms]" aria-hidden="true">
        <div class="grid grid-cols-3 gap-3">
          ${colourMeanings
            .map(
              (c, i) => `
            <div class="aspect-[3/4] rounded-2xl shadow-lg ring-1 ring-black/5 transition duration-500 hover:-translate-y-2 ${i % 3 === 1 ? 'translate-y-6' : ''}"
              style="background:${c.hex}">
              <div class="flex h-full flex-col justify-end p-3">
                <span class="rounded-lg bg-white/85 px-2 py-1 text-[11px] font-semibold text-stone-800 backdrop-blur">${c.name}</span>
              </div>
            </div>`,
            )
            .join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function overview() {
  return `
  <section id="overview" class="container-page scroll-mt-24 py-16 sm:py-20">
    <div class="reveal max-w-2xl">
      <p class="eyebrow">Introduction</p>
      <h2 class="mt-3 text-4xl font-semibold sm:text-5xl">The quiet power of colour</h2>
      <div class="prose-cm mt-5 text-lg">
        <p>
          We rarely stop to think about colour, yet it works on us all day long. It helps
          us decide what to eat, warns us of danger, tells us when to celebrate and connects
          us to our heritage. In Bahrain, colour is woven into everything — the red and white
          of our flag, the green of palm groves, and the warm earthy tones of traditional crafts.
        </p>
      </div>
    </div>
    <div class="mt-12 grid gap-5 md:grid-cols-3">
      ${pillars
        .map(
          (p, i) => `
        <article class="card reveal group p-7 transition duration-300 hover:-translate-y-1" style="transition-delay:${i * 80}ms">
          <div class="grid size-12 place-items-center rounded-2xl text-2xl" style="background:${p.tint}">${p.emoji}</div>
          <h3 class="mt-5 text-2xl font-semibold">${p.title}</h3>
          <p class="mt-3 leading-relaxed text-ink-soft">${p.text}</p>
          <ul class="mt-5 space-y-2 text-sm text-ink-muted">
            ${p.points.map((pt) => `<li class="flex gap-2"><span class="mt-2 size-1.5 shrink-0 rounded-full" style="background:${p.accent}"></span>${pt}</li>`).join('')}
          </ul>
        </article>`,
        )
        .join('')}
    </div>
  </section>`;
}

function explorer() {
  return `
  <section class="container-page py-8">
    <div class="card reveal overflow-hidden">
      <div class="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div class="border-b border-line p-7 sm:p-10 lg:border-r lg:border-b-0">
          <p class="eyebrow">Interactive</p>
          <h2 class="mt-3 text-3xl font-semibold">Colour meanings explorer</h2>
          <p class="mt-3 text-ink-soft">Choose a colour to discover what it means in our culture, how it makes people feel and where you can spot it around Bahrain.</p>
          <div class="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-3" role="tablist" aria-label="Colours">
            ${colourMeanings
              .map(
                (c, i) => `
              <button type="button" role="tab" id="tab-${c.id}" aria-controls="colour-panel" aria-selected="${i === 0}"
                data-colour="${c.id}"
                class="group flex flex-col items-center gap-2 rounded-2xl p-2 transition hover:bg-surface-2 aria-selected:bg-surface-2">
                <span class="size-12 rounded-full shadow-inner ring-2 ring-transparent ring-offset-2 ring-offset-surface transition group-aria-selected:scale-110 group-aria-selected:ring-ink/60" style="background:${c.hex}"></span>
                <span class="text-xs font-medium text-ink-soft">${c.name}</span>
              </button>`,
              )
              .join('')}
          </div>
        </div>
        <div id="colour-panel" role="tabpanel" aria-live="polite" class="relative min-h-[22rem] p-7 sm:p-10"></div>
      </div>
    </div>
  </section>`;
}

function colourPanel(c) {
  return `
    <div aria-hidden="true" class="absolute inset-x-0 top-0 h-2" style="background:${c.hex}"></div>
    <div class="animate-fade-up">
      <div class="flex items-center gap-4">
        <span class="size-16 rounded-2xl shadow-lg" style="background:${c.hex}"></span>
        <div>
          <h3 class="text-3xl font-semibold">${c.name}</h3>
          <p class="font-mono text-xs text-ink-muted">${c.hex.toUpperCase()} · feels ${c.mood}</p>
        </div>
      </div>
      <dl class="mt-7 grid gap-5 sm:grid-cols-2">
        <div><dt class="eyebrow">In our culture</dt><dd class="mt-2 leading-relaxed text-ink-soft">${c.culture}</dd></div>
        <div><dt class="eyebrow">Psychology</dt><dd class="mt-2 leading-relaxed text-ink-soft">${c.psychology}</dd></div>
      </dl>
      <div class="mt-6">
        <p class="eyebrow">Where you'll see it</p>
        <div class="mt-3 flex flex-wrap gap-2">${c.spot.map((s) => `<span class="chip">${s}</span>`).join('')}</div>
      </div>
    </div>`;
}

function wireExplorer(main) {
  const panel = $('#colour-panel', main);
  const tabs = $$('[data-colour]', main);
  const select = (id, focus = false, notice = true) => {
    const c = colourMeanings.find((m) => m.id === id);
    if (notice) actions.notice(c.hex, 1);
    tabs.forEach((t) => {
      const on = t.dataset.colour === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.innerHTML = colourPanel(c);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t.dataset.colour));
    t.addEventListener('keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      select(tabs[(i + dir + tabs.length) % tabs.length].dataset.colour, true);
    });
  });
  select(colourMeanings[0].id, false, false);
}

function projectCards() {
  return `
  <section id="projects" class="container-page scroll-mt-24 py-20">
    <div class="reveal flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div class="max-w-2xl">
        <p class="eyebrow">The projects</p>
        <h2 class="mt-3 text-4xl font-semibold sm:text-5xl">Three ways to see colour</h2>
      </div>
      <p class="max-w-sm text-ink-muted">Each project looks at colour through a different lens: art and heritage, science and the senses, and the places we share.</p>
    </div>
    <div class="mt-12 grid gap-6 lg:grid-cols-3">
      ${projects
        .map(
          (p, i) => `
        <a href="#${p.path}" class="card reveal group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl" style="transition-delay:${i * 90}ms">
          <div class="relative h-52 overflow-hidden" style="background:${p.gradient}">
            <div class="absolute inset-0 transition duration-700 group-hover:scale-105">${p.art}</div>
            <span class="absolute top-4 left-4 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Project ${i + 1}</span>
          </div>
          <div class="flex flex-1 flex-col p-7">
            <p class="eyebrow">${p.kicker}</p>
            <h3 class="mt-2 text-2xl font-semibold">${p.title}</h3>
            <p class="mt-3 flex-1 leading-relaxed text-ink-soft">${p.text}</p>
            <div class="mt-5 flex flex-wrap gap-2">${p.tags.map((t) => `<span class="chip">${t}</span>`).join('')}</div>
            <span class="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
              Open project
              <span class="transition group-hover:translate-x-1">${icons.arrow}</span>
            </span>
          </div>
        </a>`,
        )
        .join('')}
    </div>
  </section>`;
}

function quote() {
  return `
  <section class="container-page">
    <figure class="reveal relative overflow-hidden rounded-[2rem] bg-emerald-deep px-7 py-14 text-center text-white sm:px-16 sm:py-20">
      <div aria-hidden="true" class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(201_139_94/0.45),transparent_45%),radial-gradient(circle_at_80%_80%,rgb(15_118_110/0.8),transparent_50%)]"></div>
      <blockquote class="relative mx-auto max-w-3xl font-display text-2xl leading-snug sm:text-4xl">
        “Colour is a power which directly influences the soul.”
      </blockquote>
      <figcaption class="relative mt-6 text-sm tracking-wide text-white/75">— Wassily Kandinsky, <cite>Concerning the Spiritual in Art</cite></figcaption>
      <a href="#/blog" class="btn relative mt-10 bg-white text-emerald-deep hover:-translate-y-0.5 hover:shadow-xl">Share where colour moves you ${icons.arrow}</a>
    </figure>
  </section>`;
}

export const NOTICE =
  'Notice: This is a preliminary version of the website, and further updates will be made during this week. We kindly request your valuable feedback and notes to improve and refine it.';

const FEEDBACK_LINK = '#/blog?post=bab-al-bahrain-night';
const READ_SECONDS = 6;

/** Slim reminder bar at the top of the home page. */
function previewBanner() {
  return `
  <div class="notice-stripes text-stone-900">
    <div class="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 text-sm font-semibold">
      <p class="flex items-center gap-2">${warningIcon('size-5')} Preliminary version: updates are coming this week.</p>
      <a href="${FEEDBACK_LINK}" class="underline decoration-2 underline-offset-2 hover:no-underline">Leave your feedback</a>
    </div>
  </div>`;
}

function warningIcon(size = 'size-6') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="${size} shrink-0" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>`;
}

/**
 * Required-reading notice. It covers the page when the home page first
 * loads and cannot be dismissed until the visitor ticks "I have read it",
 * waits for the short reading timer, and confirms they really read it.
 * Shown once per page load. Returns a cleanup function for the router.
 */
let noticeShown = false;
function showNotice() {
  if (noticeShown) return undefined;
  noticeShown = true;

  const root = document.createElement('div');
  root.className = 'fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md';
  root.innerHTML = `
    <div data-panel role="alertdialog" aria-modal="true" aria-labelledby="notice-title" aria-describedby="notice-body"
      class="w-full max-w-lg overflow-hidden rounded-3xl bg-surface shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] ring-4 ring-amber-400 animate-fade-up">
      <div class="notice-stripes h-3" aria-hidden="true"></div>
      <div data-step class="p-6 sm:p-8"></div>
    </div>`;
  document.body.appendChild(root);
  document.body.style.overflow = 'hidden';
  const panel = root.querySelector('[data-panel]');
  const stepEl = root.querySelector('[data-step]');
  let timer = null;

  const shake = () => {
    panel.classList.remove('notice-shake');
    void panel.offsetWidth;
    panel.classList.add('notice-shake');
  };

  function stepRead(seconds = READ_SECONDS) {
    stepEl.innerHTML = `
      <div class="flex items-center gap-3 text-amber-600 dark:text-amber-400">
        <span class="grid size-14 place-items-center rounded-2xl bg-amber-100 dark:bg-amber-500/15 animate-pulse">${warningIcon('size-8')}</span>
        <div>
          <p class="text-xs font-bold tracking-[0.2em] uppercase">Important · Please read</p>
          <h2 id="notice-title" class="text-2xl font-semibold text-ink sm:text-3xl">Before you continue</h2>
        </div>
      </div>
      <div id="notice-body" class="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 dark:bg-amber-500/10">
        <p data-notice-text class="text-lg leading-relaxed font-medium text-ink">${esc(NOTICE)}</p>
      </div>
      <label class="mt-6 flex cursor-pointer items-start gap-3 rounded-xl p-2 transition hover:bg-surface-2">
        <input id="notice-ack" type="checkbox" class="mt-0.5 size-5 shrink-0 cursor-pointer accent-amber-500" />
        <span class="text-sm font-medium text-ink">I have read and understood this notice.</span>
      </label>
      <button type="button" data-next class="btn mt-5 w-full bg-amber-500 py-3.5 text-base text-stone-900 hover:bg-amber-400" disabled></button>`;
    const ack = stepEl.querySelector('#notice-ack');
    const next = stepEl.querySelector('[data-next]');
    let left = seconds;
    const update = () => {
      next.disabled = left > 0 || !ack.checked;
      next.textContent = left > 0 ? `Please read the notice (${left})` : ack.checked ? 'Continue' : 'Tick the box to continue';
    };
    clearInterval(timer);
    timer = setInterval(() => {
      left -= 1;
      if (left <= 0) clearInterval(timer);
      update();
    }, 1000);
    ack.addEventListener('change', update);
    next.addEventListener('click', stepConfirm);
    update();
    ack.focus();
  }

  function stepConfirm() {
    stepEl.innerHTML = `
      <div class="text-center">
        <span class="mx-auto grid size-16 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">${warningIcon('size-9')}</span>
        <h2 id="notice-title" class="mt-5 text-2xl font-semibold sm:text-3xl">Are you sure you read the notice?</h2>
        <p id="notice-body" class="mx-auto mt-3 max-w-sm leading-relaxed text-ink-soft">
          This is a <strong class="text-ink">preliminary version</strong>. It will be updated <strong class="text-ink">this week</strong>, and your feedback is needed to improve it.
        </p>
        <div class="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" data-again class="btn btn-ghost py-3">No, show it again</button>
          <button type="button" data-yes class="btn bg-amber-500 py-3 text-stone-900 hover:bg-amber-400">Yes, I have read it</button>
        </div>
      </div>`;
    stepEl.querySelector('[data-again]').addEventListener('click', () => stepRead(3));
    stepEl.querySelector('[data-yes]').addEventListener('click', () => {
      close();
      toast('Thank you! Please leave your feedback on the blog.');
    });
    stepEl.querySelector('[data-yes]').focus();
  }

  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      shake();
    }
    if (e.key === 'Tab') trapFocus(e, root);
  };
  root.addEventListener('mousedown', (e) => {
    if (e.target === root) shake();
  });
  document.addEventListener('keydown', onKey);

  function close() {
    clearInterval(timer);
    document.removeEventListener('keydown', onKey);
    root.remove();
    document.body.style.overflow = '';
  }

  stepRead();
  return close;
}
