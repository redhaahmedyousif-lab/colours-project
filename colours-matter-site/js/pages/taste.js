import { $, $$, esc, icons, timeAgo } from '../lib/dom.js?v=muu366i1';
import { toast } from '../lib/ui.js?v=muu366i1';
import { actions, store } from '../lib/app.js?v=muu366i1';
import { cleanText, rateLimit } from '../lib/sanitize.js?v=muu366i1';
import { animateStats } from '../lib/motion.js?v=muu366i1';
import { pageHero, statement } from '../components/sections.js?v=muu366i1';
import { mountDiscovery } from '../components/discovery.js?v=muu366i1';
import { entries as seedEntries, foods, isSampleData, method, project, reactions, variables } from '../data/taste.js?v=muu366i1';

const foodById = Object.fromEntries(foods.map((f) => [f.id, f]));
const differentLabel = { yes: 'Yes', no: 'No', unsure: 'Not sure' };
const modeLabel = { visual: 'Sees colour', blind: 'Blindfolded' };
const view = { food: 'all', mode: 'all', query: '', trialMode: 'visual' };

const allEntries = () => [...seedEntries, ...store.get().taste];
const avg = (list, key) => (list.length ? list.reduce((s, e) => s + e[key], 0) / list.length : null);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const fmt = (v, d = 1) => (v == null ? '–' : v.toFixed(d));
const signed = (v) => (v == null ? '–' : `${v > 0 ? '+' : v < 0 ? '−' : '±'}${Math.abs(v).toFixed(1)}`);

function stats(list) {
  const visual = list.filter((e) => e.mode !== 'blind');
  const blind = list.filter((e) => e.mode === 'blind');
  const perFood = foods.map((f) => {
    const v = visual.filter((e) => e.food === f.id);
    const b = blind.filter((e) => e.food === f.id);
    const taste = avg(v, 'taste');
    const blindTaste = avg(b, 'taste');
    return {
      food: f,
      visualCount: v.length,
      blindCount: b.length,
      look: avg(v, 'look'),
      taste,
      blindTaste,
      effect: taste != null && blindTaste != null ? taste - blindTaste : null,
    };
  });
  const withEffect = perFood.filter((p) => p.effect != null);
  const tasteVisual = avg(visual, 'taste');
  const tasteBlind = avg(blind, 'taste');
  return {
    total: list.length,
    visualCount: visual.length,
    blindCount: blind.length,
    look: avg(visual, 'look'),
    tasteVisual,
    tasteBlind,
    effect: tasteVisual != null && tasteBlind != null ? tasteVisual - tasteBlind : null,
    yes: pct(visual.filter((e) => e.different === 'yes').length, visual.length),
    unsure: pct(visual.filter((e) => e.different === 'unsure').length, visual.length),
    blindYes: pct(blind.filter((e) => e.different === 'yes').length, blind.length),
    perFood,
    strongest: withEffect.length ? withEffect.reduce((a, b) => (Math.abs(b.effect) > Math.abs(a.effect) ? b : a)) : null,
    lowestLook: perFood.filter((p) => p.look != null).reduce((a, b) => (!a || b.look < a.look ? b : a), null),
  };
}

/* ---------------- Page ---------------- */

export function renderTaste(main) {
  Object.assign(view, { food: 'all', mode: 'all', query: '', trialMode: 'visual' });
  main.innerHTML = `
    ${pageHero({
      number: 2,
      kicker: 'Colour & Taste',
      title: project.title,
      text: 'Do we taste with our eyes? Five everyday foods were recoloured, without changing their recipes, then tasted twice: once seeing the colour and once blindfolded.',
      accent: 'from-blue-500/25 via-emerald-400/20 to-transparent',
    })}
    ${statement({ title: project.title, en: project.en })}
    ${setup()}
    ${foodsSection()}
    ${trialSection()}
    <section class="container-page py-20" aria-labelledby="results-title">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p class="eyebrow">Results</p>
          <h2 id="results-title" class="mt-3 text-4xl font-semibold">What happened</h2>
        </div>
        ${isSampleData ? `<p class="flex max-w-md items-start gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-xs text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">${icons.info}<span>The log includes <strong>example entries</strong> to show how the page works. Replace them with your real observations in <code>js/data/taste.js</code>.</span></p>` : ''}
      </div>
      <div data-stats class="mt-10"></div>
      <div data-charts class="mt-6 grid gap-6 xl:grid-cols-2"></div>
    </section>
    <div class="cv-auto">${logSection()}</div>
    <div data-evaluation></div>
    <section class="container-page pt-12"><div data-discovery></div></section>
  `;

  wireFoods(main);
  wireTrial(main);
  wireLog(main);

  const stops = [
    store.subscribe((s) => s.taste, () => refresh(main)),
    mountDiscovery($('[data-discovery]', main), '/taste'),
  ];
  actions.loadTaste();
  return () => stops.forEach((s) => s());
}

let stopStats = () => {};
function refresh(main) {
  const list = allEntries();
  const s = stats(list);
  $('[data-stats]', main).innerHTML = statTiles(s);
  $('[data-charts]', main).innerHTML = blindChart(s) + lookChart(s);
  wireTooltips(main);
  renderLog(main);
  $('[data-evaluation]', main).innerHTML = evaluation(s);
  $$('[data-food-avg]', main).forEach((el) => {
    const p = s.perFood.find((x) => x.food.id === el.dataset.foodAvg);
    el.innerHTML = p.visualCount
      ? `<span>Seen <strong class="text-ink">${fmt(p.taste)}</strong></span><span>Blind <strong class="text-ink">${fmt(p.blindTaste)}</strong></span>`
      : '<span>No results yet</span>';
  });
  stopStats();
  stopStats = animateStats(main);
}

/* ---------------- Design + foods ---------------- */

function setup() {
  return `
  <section class="container-page" aria-label="Experiment design">
    <div class="grid gap-5 lg:grid-cols-3">
      <article class="card p-7 lg:col-span-1">
        <p class="eyebrow">Question</p>
        <h2 class="mt-3 text-2xl font-semibold">Does the colour of food change how it tastes?</h2>
        <div class="mt-6 rounded-2xl bg-surface-2 p-5">
          <p class="eyebrow">Hypothesis</p>
          <p class="mt-2 leading-relaxed text-ink-soft">If a familiar food is an unexpected colour, people will rate it as less appetising and believe it tastes different, even though the recipe has not changed. Blindfolded, the difference should disappear.</p>
        </div>
      </article>
      <article class="card p-7 lg:col-span-2">
        <p class="eyebrow">Method</p>
        <ol class="mt-4 grid gap-3 sm:grid-cols-2">
          ${method
            .map(
              (m, i) => `
            <li class="flex gap-3">
              <span class="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-canvas">${i + 1}</span>
              <span class="text-sm leading-relaxed text-ink-soft">${m}</span>
            </li>`,
            )
            .join('')}
        </ol>
        <dl class="mt-6 grid gap-3 border-t border-line pt-6 text-sm sm:grid-cols-3">
          ${Object.entries(variables)
            .map(([k, v]) => `<div><dt class="eyebrow">${k} variable</dt><dd class="mt-1.5 text-ink-soft">${v}</dd></div>`)
            .join('')}
        </dl>
      </article>
    </div>
  </section>`;
}

function plate(colour, emoji, { blind = false, size = 'size-28 sm:size-36', inner = 'size-20 sm:size-24' } = {}) {
  return `
    <div class="plate relative grid ${size} place-items-center rounded-full bg-white shadow-[inset_0_-6px_18px_rgb(0_0_0/0.08),0_14px_30px_-12px_rgb(0_0_0/0.35)] ring-1 ring-black/5 ${blind ? 'is-blind' : ''}">
      <div class="${inner} rounded-full shadow-inner transition-[background-color] duration-700" data-plate-fill style="background:${colour}"></div>
      <span class="plate-cloth" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="size-8"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.4 10.4 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.4 3.5M6.6 6.6C4.6 8 3.3 10 2 12c1 2.5 5 7 10 7 1.7 0 3.3-.5 4.6-1.3"/></svg></span>
      <span class="absolute -right-1 -bottom-1 grid size-10 place-items-center rounded-full bg-surface text-xl shadow ring-1 ring-line" aria-hidden="true">${emoji}</span>
    </div>`;
}

function foodsSection() {
  return `
  <section class="container-page pt-20" aria-labelledby="foods-title">
    <div class="max-w-2xl">
      <p class="eyebrow">The five foods</p>
      <h2 id="foods-title" class="mt-3 text-4xl font-semibold">Same taste, new colour</h2>
    </div>
    <div class="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
      ${foods
        .map(
          (f) => `
        <article class="card flex flex-col items-center p-4 text-center sm:p-6" data-food-card="${f.id}">
          ${plate(f.changed, f.emoji)}
          <h3 class="mt-5 text-base leading-tight font-semibold sm:text-lg">${f.name}</h3>
          <p class="mt-2 flex-1 text-xs leading-relaxed text-ink-muted">${f.note}</p>
          <div class="mt-4 inline-flex rounded-full border border-line bg-surface-2 p-1 text-xs font-medium" role="group" aria-label="Colour of ${f.name}">
            <button type="button" class="rounded-full px-3 py-1 transition aria-pressed:bg-surface aria-pressed:shadow" aria-pressed="false" data-swap="natural">${f.naturalName}</button>
            <button type="button" class="rounded-full px-3 py-1 transition aria-pressed:bg-surface aria-pressed:shadow" aria-pressed="true" data-swap="changed">${f.changedName}</button>
          </div>
          <p class="mt-4 flex flex-wrap justify-center gap-x-3 text-xs text-ink-muted" data-food-avg="${f.id}"></p>
        </article>`,
        )
        .join('')}
    </div>
  </section>`;
}

function wireFoods(main) {
  $$('[data-food-card]', main).forEach((card) => {
    const food = foodById[card.dataset.foodCard];
    const fill = $('[data-plate-fill]', card);
    $$('[data-swap]', card).forEach((btn) =>
      btn.addEventListener('click', () => {
        $$('[data-swap]', card).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        fill.style.background = food[btn.dataset.swap];
        actions.notice(food[btn.dataset.swap], 0.4);
      }),
    );
  });
}

/* ---------------- Trial: blind vs visual ---------------- */

function trialSection() {
  const f = foods[0];
  return `
  <section class="container-page pt-20" aria-labelledby="trial-title">
    <div class="card overflow-hidden">
      <div class="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div class="trial-stage relative grid place-items-center gap-6 overflow-hidden p-8 sm:p-10" data-trial-stage>
          <div class="inline-flex rounded-full border border-line bg-surface p-1 text-sm font-semibold" role="radiogroup" aria-label="Tasting mode">
            <button type="button" role="radio" aria-checked="true" data-trial-mode="visual" class="trial-mode">${icons.image} Sees colour</button>
            <button type="button" role="radio" aria-checked="false" data-trial-mode="blind" class="trial-mode">Blindfolded</button>
          </div>
          <div data-trial-plate>${plate(f.changed, f.emoji, { size: 'size-44 sm:size-52', inner: 'size-32 sm:size-36' })}</div>
          <p class="max-w-xs text-center text-sm text-ink-muted" data-trial-caption>The tester sees the ${f.changedName} colour before tasting.</p>
        </div>
        <form class="border-t border-line p-6 sm:p-8 lg:border-t-0 lg:border-l" data-entry-form novalidate>
          <p class="eyebrow">Run a trial</p>
          <h2 id="trial-title" class="mt-2 text-2xl font-semibold">Log a taste test</h2>
          <div class="mt-5 grid gap-4">
            <div class="grid gap-3 sm:grid-cols-2">
              <label><span class="label">Food</span>
                <select class="field" id="trial-food" name="food">
                  ${foods.map((x) => `<option value="${x.id}">${x.emoji} ${x.name}</option>`).join('')}
                </select>
              </label>
              <label><span class="label">Tester’s first name</span>
                <input class="field" id="trial-tester" name="tester" maxlength="30" placeholder="e.g. Noor" autocomplete="off" />
              </label>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div data-look-field>${ratingField('look', 'Looks (1–5)')}</div>
              ${ratingField('taste', 'Tastes (1–5)')}
            </div>
            <fieldset>
              <legend class="label">Did it taste different from normal?</legend>
              <div class="grid grid-cols-3 gap-2">
                ${Object.entries(differentLabel)
                  .map(
                    ([v, l], i) => `
                  <label class="cursor-pointer">
                    <input type="radio" name="different" value="${v}" class="peer sr-only" ${i === 0 ? 'checked' : ''} />
                    <span class="block rounded-xl border border-line py-2 text-center text-sm transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-canvas peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-glaze">${l}</span>
                  </label>`,
                  )
                  .join('')}
              </div>
            </fieldset>
            <fieldset>
              <legend class="label">Reaction</legend>
              <div class="flex justify-between gap-1">
                ${reactions
                  .map(
                    (r, i) => `
                  <label class="cursor-pointer">
                    <input type="radio" name="reaction" value="${r}" class="peer sr-only" ${i === 0 ? 'checked' : ''} />
                    <span class="grid size-11 place-items-center rounded-xl border border-line text-xl transition peer-checked:scale-110 peer-checked:border-ink peer-checked:bg-surface-2 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-glaze">${r}</span>
                  </label>`,
                  )
                  .join('')}
              </div>
            </fieldset>
            <label><span class="label">What did they say?</span>
              <textarea class="field min-h-20 resize-y" id="trial-comment" name="comment" maxlength="240" placeholder="Their words, in quotes…"></textarea>
            </label>
            <p data-form-error class="hidden text-sm text-red-600 dark:text-red-400" role="alert"></p>
            <button class="btn btn-primary w-full" type="submit">${icons.plus} Add to results</button>
          </div>
        </form>
      </div>
    </div>
  </section>`;
}

function ratingField(name, label) {
  return `
    <label><span class="label">${label}</span>
      <select class="field" id="trial-${name}" name="${name}">
        ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}" ${n === 3 ? 'selected' : ''}>${n} ${'★'.repeat(n)}</option>`).join('')}
      </select>
    </label>`;
}

function wireTrial(main) {
  const form = $('[data-entry-form]', main);
  const stage = $('[data-trial-stage]', main);
  const plateWrap = $('[data-trial-plate]', main);
  const caption = $('[data-trial-caption]', main);
  const lookField = $('[data-look-field]', main);
  const error = $('[data-form-error]', form);
  const modes = $$('[data-trial-mode]', main);

  const sync = () => {
    const f = foodById[form.food.value];
    const blind = view.trialMode === 'blind';
    plateWrap.innerHTML = plate(f.changed, f.emoji, { blind, size: 'size-44 sm:size-52', inner: 'size-32 sm:size-36' });
    caption.textContent = blind ? 'The tester is blindfolded, so the colour cannot influence them.' : `The tester sees the ${f.changedName} colour before tasting.`;
    lookField.classList.toggle('is-disabled', blind);
    form.look.disabled = blind;
    stage.classList.toggle('is-blind', blind);
  };

  modes.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      view.trialMode = btn.dataset.trialMode;
      modes.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      sync();
    });
    btn.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      modes[(i + 1) % 2].click();
      modes[(i + 1) % 2].focus();
    });
  });
  form.food.addEventListener('change', () => {
    sync();
    if (view.trialMode === 'visual') actions.notice(foodById[form.food.value].changed, 0.4);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const tester = cleanText(data.get('tester'), 30);
    const fail = (msg, field) => {
      error.textContent = msg;
      error.classList.remove('hidden');
      field?.focus();
    };
    if (!tester) return fail('Please add the tester’s name.', form.tester);
    const wait = rateLimit('taste', { max: 12, windowMs: 600_000, minGapMs: 2_000 });
    if (wait) return fail(`Please wait ${wait} seconds before logging another result.`);
    error.classList.add('hidden');

    const blind = view.trialMode === 'blind';
    const entry = {
      food: foodById[data.get('food')] ? data.get('food') : foods[0].id,
      tester,
      mode: blind ? 'blind' : 'visual',
      look: blind ? null : Number(data.get('look')),
      taste: Number(data.get('taste')),
      different: differentLabel[data.get('different')] ? data.get('different') : 'unsure',
      reaction: reactions.includes(data.get('reaction')) ? data.get('reaction') : reactions[0],
      comment: cleanText(data.get('comment'), 240),
    };
    const submit = $('button[type=submit]', form);
    submit.disabled = true;
    try {
      const added = await actions.addTaste(entry);
      form.tester.value = '';
      form.comment.value = '';
      if (!added.pending) toast(`Added ${entry.tester}’s ${blind ? 'blind' : 'visual'} result`);
    } catch (err) {
      fail(err.message);
    } finally {
      submit.disabled = false;
    }
  });
  sync();
}

/* ---------------- Results ---------------- */

function statTiles(s) {
  const tiles = [
    { label: 'Taste tests logged', value: s.total, sub: `${s.visualCount} seen · ${s.blindCount} blindfolded`, count: s.total, decimals: 0 },
    {
      label: 'Colour effect on taste',
      value: signed(s.effect),
      sub: 'points, seen vs blindfolded',
      count: s.effect,
      decimals: 1,
    },
    { label: 'Said it tasted different', value: `${s.yes}%`, sub: 'when they could see the colour', count: s.yes, suffix: '%' },
    { label: 'Noticed a difference blind', value: `${s.blindYes}%`, sub: 'with the colour hidden', count: s.blindYes, suffix: '%' },
  ];
  return `
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      ${tiles
        .map(
          (t) => `
        <div class="card p-5 sm:p-6">
          <p class="text-xs font-medium text-ink-muted">${t.label}</p>
          <p class="mt-2 font-display text-4xl font-semibold tabular-nums" ${
            t.count != null && t.label !== 'Colour effect on taste'
              ? `data-count-to="${t.count}" data-decimals="${t.decimals ?? 0}" data-suffix="${t.suffix ?? ''}"`
              : ''
          }>${t.value}</p>
          <p class="mt-1 text-xs text-ink-muted">${t.sub}</p>
        </div>`,
        )
        .join('')}
    </div>`;
}

function axis() {
  return `
    <div></div>
    <div class="relative mb-2 h-4 text-[11px] text-ink-muted" aria-hidden="true">
      ${[0, 1, 2, 3, 4, 5].map((t) => `<span class="absolute -translate-x-1/2 tabular-nums" style="left:${t * 20}%">${t}</span>`).join('')}
    </div>`;
}

function bars(p, series) {
  return `
    <div class="relative flex flex-col justify-center gap-[2px] py-3">
      ${[0, 1, 2, 3, 4, 5].map((t) => `<span aria-hidden="true" class="absolute inset-y-0 w-px bg-line" style="left:${t * 20}%"></span>`).join('')}
      ${series
        .map((se) => {
          const v = p[se.key];
          const w = v == null ? 0 : (v / 5) * 100;
          return `
        <div class="relative flex h-4 items-center" data-tip="${esc(p.food.name)} · ${se.label}: ${fmt(v)} / 5">
          <span class="h-full rounded-r-[4px]" data-grow-to="${w.toFixed(1)}" style="width:${w.toFixed(1)}%;background:${se.color}"></span>
          <span class="ml-2 text-xs font-medium text-ink-soft tabular-nums">${v == null ? '' : fmt(v)}</span>
        </div>`;
        })
        .join('')}
    </div>`;
}

function chartFrame({ title, sub, series, rows }) {
  return `
  <figure class="card relative min-w-0 p-6 sm:p-8" data-chart-root>
    <div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <figcaption>
        <h3 class="font-sans text-lg font-semibold">${title}</h3>
        <p class="mt-1 text-sm text-ink-muted">${sub}</p>
      </figcaption>
      <ul class="flex shrink-0 flex-wrap gap-4 text-sm text-ink-soft" aria-label="Legend">
        ${series.map((se) => `<li class="flex items-center gap-2"><span class="size-3 rounded-sm" style="background:${se.color}"></span>${se.label}</li>`).join('')}
      </ul>
    </div>
    <div class="mt-8 grid grid-cols-[minmax(6.5rem,9rem)_1fr] gap-x-4">${rows}</div>
    <div data-tooltip role="tooltip" class="pointer-events-none absolute z-10 hidden rounded-lg bg-ink px-3 py-1.5 text-xs font-medium whitespace-nowrap text-canvas shadow-lg"></div>
  </figure>`;
}

function blindChart(s) {
  const series = [
    { key: 'blindTaste', label: 'Blindfolded', color: 'var(--series-3)' },
    { key: 'taste', label: 'Sees colour', color: 'var(--series-2)' },
  ];
  return chartFrame({
    title: 'Blindfolded vs seeing the colour',
    sub: 'Average taste rating (1–5). The number after each food is the colour effect.',
    series,
    rows:
      axis() +
      s.perFood
        .map(
          (p) => `
        <div class="flex items-center justify-between gap-2 py-3 text-sm font-medium">
          <span class="flex items-center">${p.food.emoji}<span class="ml-2 leading-tight">${p.food.name}</span></span>
          <span class="effect-chip ${p.effect == null ? 'opacity-0' : p.effect < 0 ? 'is-down' : 'is-up'}" title="Colour effect">${signed(p.effect)}</span>
        </div>
        ${bars(p, series)}`,
        )
        .join(''),
  });
}

function lookChart(s) {
  const series = [
    { key: 'look', label: 'Looks appetising', color: 'var(--series-1)' },
    { key: 'taste', label: 'Tastes good', color: 'var(--series-2)' },
  ];
  return chartFrame({
    title: 'How it looked vs how it tasted',
    sub: 'Seen in colour only. A big gap means the eyes misjudged the food.',
    series,
    rows:
      axis() +
      s.perFood
        .map((p) => `<div class="flex items-center py-3 text-sm font-medium">${p.food.emoji}<span class="ml-2 leading-tight">${p.food.name}</span></div>${bars(p, series)}`)
        .join(''),
  });
}

function wireTooltips(main) {
  $$('[data-chart-root]', main).forEach((root) => {
    const tip = $('[data-tooltip]', root);
    $$('[data-tip]', root).forEach((bar) => {
      bar.addEventListener('mousemove', (e) => {
        const box = root.getBoundingClientRect();
        tip.textContent = bar.dataset.tip;
        tip.classList.remove('hidden');
        const x = Math.min(e.clientX - box.left + 12, box.width - tip.offsetWidth - 8);
        tip.style.left = `${Math.max(8, x)}px`;
        tip.style.top = `${e.clientY - box.top - 40}px`;
      });
      bar.addEventListener('mouseleave', () => tip.classList.add('hidden'));
    });
  });
}

/* ---------------- Log ---------------- */

function logSection() {
  return `
  <section class="container-page" aria-labelledby="log-title">
    <div class="card min-w-0 p-6 sm:p-8">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="eyebrow">Results log</p>
          <h2 id="log-title" class="mt-2 text-2xl font-semibold">Every reaction, recorded</h2>
        </div>
        <button type="button" class="btn btn-ghost !py-2 text-xs" data-export>Copy as CSV</button>
      </div>
      <div class="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by food">
          <button type="button" class="chip" data-filter="all" aria-pressed="true">All foods</button>
          ${foods.map((f) => `<button type="button" class="chip" data-filter="${f.id}" aria-pressed="false">${f.emoji} ${f.short}</button>`).join('')}
        </div>
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by mode">
          ${['all', 'visual', 'blind'].map((m) => `<button type="button" class="chip" data-mode-filter="${m}" aria-pressed="${m === 'all'}">${m === 'all' ? 'Both rounds' : modeLabel[m]}</button>`).join('')}
        </div>
        <label class="lg:ml-auto lg:w-48"><span class="sr-only">Search the log</span>
          <input type="search" class="field !py-2" id="log-search" placeholder="Search comments…" data-search />
        </label>
      </div>
      <div class="mt-5 overflow-x-auto">
        <table class="w-full min-w-[44rem] text-left text-sm">
          <thead class="border-b border-line text-xs text-ink-muted">
            <tr>
              <th scope="col" class="py-3 pr-3 font-medium">Food</th>
              <th scope="col" class="py-3 pr-3 font-medium">Tester</th>
              <th scope="col" class="py-3 pr-3 font-medium">Round</th>
              <th scope="col" class="py-3 pr-3 font-medium">Looks</th>
              <th scope="col" class="py-3 pr-3 font-medium">Tastes</th>
              <th scope="col" class="py-3 pr-3 font-medium">Different?</th>
              <th scope="col" class="py-3 font-medium">Reaction</th>
            </tr>
          </thead>
          <tbody data-log class="divide-y divide-line"></tbody>
        </table>
      </div>
      <p data-log-count class="mt-4 text-xs text-ink-muted"></p>
    </div>
  </section>`;
}

function stars(n) {
  if (n == null) return '<span class="text-ink-muted">—</span>';
  return `<span class="tabular-nums" aria-label="${n} out of 5"><span class="text-amber-500">${'★'.repeat(n)}</span><span class="text-line">${'★'.repeat(5 - n)}</span></span>`;
}

function renderLog(main) {
  const list = allEntries();
  const q = view.query.trim().toLowerCase();
  const canDelete = store.get().mode === 'local';
  const rows = list
    .filter((e) => view.food === 'all' || e.food === view.food)
    .filter((e) => view.mode === 'all' || (e.mode ?? 'visual') === view.mode)
    .filter((e) => !q || `${e.tester} ${e.comment} ${foodById[e.food]?.name}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt);

  $('[data-log]', main).innerHTML = rows.length
    ? rows
        .map((e) => {
          const f = foodById[e.food];
          const blind = e.mode === 'blind';
          return `
      <tr class="align-top">
        <td class="py-3.5 pr-3"><span class="flex items-center gap-2 font-medium"><span class="size-3 shrink-0 rounded-full" style="background:${blind ? 'var(--cm-ink-muted)' : f.changed}"></span>${esc(f.name)}</span></td>
        <td class="py-3.5 pr-3">
          <span class="font-medium">${esc(e.tester)}</span>
          ${e.sample ? '<span class="ml-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-muted">example</span>' : e.pending ? '<span class="pending-chip mt-1">Waiting to send</span>' : `<span class="block text-[11px] text-ink-muted">${timeAgo(e.createdAt)}</span>`}
        </td>
        <td class="py-3.5 pr-3"><span class="chip !py-0.5 ${blind ? '' : '!border-transparent !bg-surface-2'}">${modeLabel[e.mode ?? 'visual']}</span></td>
        <td class="py-3.5 pr-3 whitespace-nowrap">${stars(e.look)}</td>
        <td class="py-3.5 pr-3 whitespace-nowrap">${stars(e.taste)}</td>
        <td class="py-3.5 pr-3">${differentLabel[e.different] ?? ''}</td>
        <td class="py-3.5">
          <div class="flex items-start gap-2">
            <span class="text-lg leading-none" aria-hidden="true">${esc(e.reaction)}</span>
            <span class="flex-1 text-ink-soft">${e.comment ? `“${esc(e.comment)}”` : '<span class="text-ink-muted">—</span>'}</span>
            ${!e.sample && e.own && (canDelete || e.pending) ? `<button type="button" class="rounded-md p-1 text-ink-muted transition hover:bg-surface-2 hover:text-red-600" data-delete="${esc(e.id)}" aria-label="Delete entry by ${esc(e.tester)}">${icons.trash}</button>` : ''}
          </div>
        </td>
      </tr>`;
        })
        .join('')
    : '<tr><td colspan="7" class="py-10 text-center text-ink-muted">No entries match.</td></tr>';

  $('[data-log-count]', main).textContent = `Showing ${rows.length} of ${list.length} entries`;
}

function wireLog(main) {
  $$('[data-filter]', main).forEach((btn) =>
    btn.addEventListener('click', () => {
      view.food = btn.dataset.filter;
      $$('[data-filter]', main).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderLog(main);
    }),
  );
  $$('[data-mode-filter]', main).forEach((btn) =>
    btn.addEventListener('click', () => {
      view.mode = btn.dataset.modeFilter;
      $$('[data-mode-filter]', main).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderLog(main);
    }),
  );
  $('[data-search]', main).addEventListener('input', (e) => {
    view.query = e.target.value;
    renderLog(main);
  });

  $('[data-log]', main).addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    try {
      await actions.deleteTaste(btn.dataset.delete);
      toast('Entry removed');
    } catch (err) {
      toast(err.message);
    }
  });

  $('[data-export]', main).addEventListener('click', () => {
    const header = ['food', 'tester', 'round', 'looks_appetising', 'tastes_good', 'tasted_different', 'reaction', 'comment'];
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = allEntries().map((e) =>
      [foodById[e.food].name, e.tester, modeLabel[e.mode ?? 'visual'], e.look, e.taste, differentLabel[e.different], e.reaction, e.comment].map(cell).join(','),
    );
    navigator.clipboard
      .writeText([header.join(','), ...lines].join('\n'))
      .then(() => toast('Copied. Paste into Excel or Google Sheets'))
      .catch(() => toast('Copying is blocked here. Try another browser'));
  });
}

/* ---------------- Evaluation ---------------- */

function evaluation(s) {
  const influenced = s.yes + s.unsure;
  const strong = s.effect != null && Math.abs(s.effect) >= 0.5;
  const verdict =
    strong || influenced >= 50
      ? { title: 'Yes. Colour changed the experience of taste.', tone: 'Our hypothesis was supported.' }
      : influenced >= 25
        ? { title: 'Partly. Colour influenced some people.', tone: 'Our hypothesis was partly supported.' }
        : { title: 'Not really. Most people tasted the food as normal.', tone: 'Our hypothesis was not supported.' };
  const st = s.strongest;

  return `
  <section class="container-page pt-20" aria-labelledby="eval-title">
    <div class="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1e3a8a,#2563eb_45%,#16a34a)] p-1">
      <div class="rounded-[calc(2rem-4px)] bg-surface p-7 sm:p-10">
        <p class="eyebrow">Evaluation</p>
        <h2 id="eval-title" class="mt-3 text-3xl font-semibold sm:text-4xl">Does colour change taste?</h2>
        <p class="mt-4 font-display text-2xl leading-snug text-ink">${verdict.title}</p>
        <div class="mt-8 grid gap-8 lg:grid-cols-3">
          <div>
            <h3 class="font-sans text-base font-semibold">What the data shows</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">
              ${verdict.tone} Blindfolded, the foods averaged <strong>${fmt(s.tasteBlind)}/5</strong>. Seen in their new colours, the same recipes averaged <strong>${fmt(s.tasteVisual)}/5</strong>, a colour effect of <strong>${signed(s.effect)}</strong> points.
              <strong>${s.yes}%</strong> of testers who could see the colour said the food tasted different, compared with <strong>${s.blindYes}%</strong> when blindfolded.
              ${st ? `The strongest effect was on <strong>${esc(st.food.name.toLowerCase())}</strong> (${signed(st.effect)}).` : ''}
            </p>
          </div>
          <div>
            <h3 class="font-sans text-base font-semibold">Why it happens</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">
              Our brains combine information from all our senses. Colour creates an <em>expectation</em> of flavour before food reaches our mouth: green suggests mint, orange suggests sweetness.
              Scientists have shown this too: in a well-known 2001 study, wine students described white wine dyed red using words normally reserved for red wine.
            </p>
          </div>
          <div>
            <h3 class="font-sans text-base font-semibold">Limitations &amp; next steps</h3>
            <ul class="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-soft">
              <li>• A small group of testers, mostly friends and family.</li>
              <li>• Testers tasted the seen round first, so they may have remembered the flavour.</li>
              <li>• Next time: randomise which round comes first and add more testers.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}
