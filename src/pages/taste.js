import { $, $$, esc, icons, timeAgo } from '../lib/dom.js';
import { load, save, uid } from '../lib/storage.js';
import { toast } from '../lib/ui.js';
import { pageHero, statement } from '../components/sections.js';
import { entries as seedEntries, foods, isSampleData, method, project, reactions, variables } from '../data/taste.js';

const STORE_KEY = 'taste-entries';
const foodById = Object.fromEntries(foods.map((f) => [f.id, f]));
const differentLabel = { yes: 'Yes', no: 'No', unsure: 'Not sure' };

const state = { filter: 'all', query: '' };

const allEntries = () => [...seedEntries, ...load(STORE_KEY, [])];
const avg = (list, key) => (list.length ? list.reduce((s, e) => s + e[key], 0) / list.length : 0);
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

function stats(list) {
  const perFood = foods.map((f) => {
    const items = list.filter((e) => e.food === f.id);
    return { food: f, count: items.length, look: avg(items, 'look'), taste: avg(items, 'taste') };
  });
  const rated = perFood.filter((p) => p.count);
  return {
    total: list.length,
    look: avg(list, 'look'),
    taste: avg(list, 'taste'),
    yes: pct(list.filter((e) => e.different === 'yes').length, list.length),
    unsure: pct(list.filter((e) => e.different === 'unsure').length, list.length),
    perFood,
    lowest: rated.length ? rated.reduce((a, b) => (b.look < a.look ? b : a)) : null,
    gap: rated.length ? rated.reduce((a, b) => (b.taste - b.look > a.taste - a.look ? b : a)) : null,
  };
}

export function renderTaste(main) {
  state.filter = 'all';
  state.query = '';
  main.innerHTML = `
    ${pageHero({
      number: 2,
      kicker: 'Colour & Taste',
      title: project.title,
      text: 'Do we taste with our eyes? Five everyday foods were recoloured, without changing their recipes, to find out whether colour changes how food tastes.',
      accent: 'from-blue-500/25 via-emerald-400/20 to-transparent',
    })}
    ${statement({ title: project.title, en: project.en })}
    ${setup()}
    ${foodsSection()}
    <section class="container-page py-20" aria-labelledby="results-title">
      <div class="reveal flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p class="eyebrow">Results</p>
          <h2 id="results-title" class="mt-3 text-4xl font-semibold">What happened</h2>
        </div>
        ${isSampleData ? `<p class="flex max-w-md items-start gap-2 rounded-2xl bg-amber-100 px-4 py-3 text-xs text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">${icons.info}<span>The log includes <strong>example entries</strong> to show how the page works. Replace them with your real observations in <code>src/data/taste.js</code>.</span></p>` : ''}
      </div>
      <div data-stats class="mt-10"></div>
      <div data-chart class="mt-6"></div>
    </section>
    ${logSection()}
    <div data-evaluation></div>
  `;

  wireFoods(main);
  wireLog(main);
  refresh(main);
}

function refresh(main) {
  const list = allEntries();
  const s = stats(list);
  $('[data-stats]', main).innerHTML = statTiles(s);
  $('[data-chart]', main).innerHTML = chart(s);
  wireChart(main);
  renderLog(main, list);
  $('[data-evaluation]', main).innerHTML = evaluation(s);
  $$('[data-food-avg]', main).forEach((el) => {
    const p = s.perFood.find((x) => x.food.id === el.dataset.foodAvg);
    el.innerHTML = p.count
      ? `<span>Looks <strong class="text-ink">${p.look.toFixed(1)}</strong>/5</span><span>Tastes <strong class="text-ink">${p.taste.toFixed(1)}</strong>/5</span>`
      : '<span>No results yet</span>';
  });
}

function setup() {
  return `
  <section class="container-page" aria-label="Experiment design">
    <div class="grid gap-5 lg:grid-cols-3">
      <article class="card reveal p-7 lg:col-span-1">
        <p class="eyebrow">Question</p>
        <h2 class="mt-3 text-2xl font-semibold">Does the colour of food change how it tastes?</h2>
        <div class="mt-6 rounded-2xl bg-surface-2 p-5">
          <p class="eyebrow">Hypothesis</p>
          <p class="mt-2 leading-relaxed text-ink-soft">If a familiar food is an unexpected colour, people will rate it as less appetising and believe it tastes different — even though the recipe has not changed.</p>
        </div>
      </article>
      <article class="card reveal p-7 lg:col-span-2">
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

function plate(colour, emoji) {
  return `
    <div class="relative grid size-28 place-items-center sm:size-36 rounded-full bg-white shadow-[inset_0_-6px_18px_rgb(0_0_0/0.08),0_14px_30px_-12px_rgb(0_0_0/0.35)] ring-1 ring-black/5">
      <div class="size-20 rounded-full shadow-inner sm:size-24 transition-[background-color] duration-700" data-plate-fill style="background:${colour}"></div>
      <span class="absolute -right-1 -bottom-1 grid size-10 place-items-center rounded-full bg-surface text-xl shadow ring-1 ring-line" aria-hidden="true">${emoji}</span>
    </div>`;
}

function foodsSection() {
  return `
  <section class="container-page pt-20" aria-labelledby="foods-title">
    <div class="reveal max-w-2xl">
      <p class="eyebrow">The five foods</p>
      <h2 id="foods-title" class="mt-3 text-4xl font-semibold">Same taste, new colour</h2>
      <p class="mt-3 text-ink-soft">Use the switch on each card to compare the food’s natural colour with its new look.</p>
    </div>
    <div class="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
      ${foods
        .map(
          (f, i) => `
        <article class="card reveal flex flex-col items-center p-4 text-center sm:p-6" style="transition-delay:${i * 60}ms" data-food-card="${f.id}">
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
      }),
    );
  });
}

function statTiles(s) {
  const tiles = [
    { label: 'Taste tests logged', value: s.total, sub: `${foods.length} foods` },
    { label: 'Average “looks appetising”', value: `${s.look.toFixed(1)}<span class="text-lg text-ink-muted">/5</span>`, sub: 'after recolouring' },
    { label: 'Average “tastes good”', value: `${s.taste.toFixed(1)}<span class="text-lg text-ink-muted">/5</span>`, sub: 'same recipe as normal' },
    { label: 'Said it tasted different', value: `${s.yes}%`, sub: `+ ${s.unsure}% not sure` },
  ];
  return `
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      ${tiles
        .map(
          (t) => `
        <div class="card p-5 sm:p-6">
          <p class="text-xs font-medium text-ink-muted">${t.label}</p>
          <p class="mt-2 font-display text-4xl font-semibold tabular-nums">${t.value}</p>
          <p class="mt-1 text-xs text-ink-muted">${t.sub}</p>
        </div>`,
        )
        .join('')}
    </div>`;
}

function chart(s) {
  const series = [
    { key: 'look', label: 'Looks appetising', color: 'var(--series-1)' },
    { key: 'taste', label: 'Tastes good', color: 'var(--series-2)' },
  ];
  return `
  <figure class="card relative p-6 sm:p-8" data-chart-root>
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <figcaption>
        <h3 class="font-sans text-lg font-semibold">Average rating per food</h3>
        <p class="mt-1 text-sm text-ink-muted">1 = not at all, 5 = very. The gap shows how much the colour misled people’s eyes.</p>
      </figcaption>
      <ul class="flex flex-wrap gap-4 text-sm text-ink-soft" aria-label="Legend">
        ${series.map((se) => `<li class="flex items-center gap-2"><span class="size-3 rounded-sm" style="background:${se.color}"></span>${se.label}</li>`).join('')}
      </ul>
    </div>
    <div class="mt-8 grid grid-cols-[minmax(7rem,10rem)_1fr] gap-x-4">
      <div></div>
      <div class="relative mb-2 h-4 text-[11px] text-ink-muted" aria-hidden="true">
        ${[0, 1, 2, 3, 4, 5].map((t) => `<span class="absolute -translate-x-1/2 tabular-nums" style="left:${t * 20}%">${t}</span>`).join('')}
      </div>
      ${s.perFood
        .map(
          (p) => `
        <div class="flex items-center py-3 text-sm font-medium">${p.food.emoji}<span class="ml-2 leading-tight">${p.food.name}</span></div>
        <div class="relative flex flex-col justify-center gap-[2px] py-3">
          ${[0, 1, 2, 3, 4, 5].map((t) => `<span aria-hidden="true" class="absolute inset-y-0 w-px bg-line" style="left:${t * 20}%"></span>`).join('')}
          ${series
            .map(
              (se) => `
            <div class="relative flex h-4 items-center" data-tip="${esc(p.food.name)} · ${se.label}: ${p.count ? p[se.key].toFixed(1) : '–'} / 5 (${p.count} tests)">
              <span class="h-full rounded-r-[4px] transition-[width] duration-700" style="width:${(p[se.key] / 5) * 100}%;background:${se.color}"></span>
              <span class="ml-2 text-xs font-medium text-ink-soft tabular-nums">${p.count ? p[se.key].toFixed(1) : ''}</span>
            </div>`,
            )
            .join('')}
        </div>`,
        )
        .join('')}
    </div>
    <div data-tooltip role="tooltip" class="pointer-events-none absolute z-10 hidden rounded-lg bg-ink px-3 py-1.5 text-xs font-medium whitespace-nowrap text-canvas shadow-lg"></div>
    <p class="sr-only">Table of the same data is available in the results log below.</p>
  </figure>`;
}

function wireChart(main) {
  const root = $('[data-chart-root]', main);
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
}

function logSection() {
  return `
  <section class="container-page" aria-labelledby="log-title">
    <div class="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div class="card reveal min-w-0 p-6 sm:p-8">
        <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p class="eyebrow">Results log</p>
            <h2 id="log-title" class="mt-2 text-2xl font-semibold">Every reaction, recorded</h2>
          </div>
          <button type="button" class="btn btn-ghost !py-2 text-xs" data-export>Copy as CSV</button>
        </div>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by food">
            <button type="button" class="chip" data-filter="all" aria-pressed="true">All</button>
            ${foods.map((f) => `<button type="button" class="chip" data-filter="${f.id}" aria-pressed="false">${f.emoji} ${f.short}</button>`).join('')}
          </div>
          <label class="sm:ml-auto sm:w-48"><span class="sr-only">Search the log</span>
            <input type="search" class="field !py-2" placeholder="Search comments…" data-search />
          </label>
        </div>
        <div class="mt-5 overflow-x-auto">
          <table class="w-full min-w-[40rem] text-left text-sm">
            <thead class="border-b border-line text-xs text-ink-muted">
              <tr>
                <th scope="col" class="py-3 pr-3 font-medium">Food</th>
                <th scope="col" class="py-3 pr-3 font-medium">Tester</th>
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

      <form class="card reveal h-fit p-6 sm:p-7 lg:sticky lg:top-24" data-entry-form novalidate>
        <p class="eyebrow">Add an observation</p>
        <h3 class="mt-2 font-sans text-lg font-semibold">Log a new taste test</h3>
        <div class="mt-5 grid gap-4">
          <label><span class="label">Food</span>
            <select class="field" name="food" required>
              ${foods.map((f) => `<option value="${f.id}">${f.emoji} ${f.name}</option>`).join('')}
            </select>
          </label>
          <label><span class="label">Tester’s first name</span>
            <input class="field" name="tester" maxlength="30" required placeholder="e.g. Noor" autocomplete="off" />
          </label>
          <div class="grid grid-cols-2 gap-3">
            ${ratingField('look', 'Looks (1–5)')}
            ${ratingField('taste', 'Tastes (1–5)')}
          </div>
          <fieldset>
            <legend class="label">Did it taste different?</legend>
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
                  <span class="grid size-11 place-items-center rounded-xl border border-line text-xl transition peer-checked:scale-110 peer-checked:border-ink peer-checked:bg-surface-2 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-glaze" aria-label="${r}">${r}</span>
                </label>`,
                )
                .join('')}
            </div>
          </fieldset>
          <label><span class="label">What did they say?</span>
            <textarea class="field min-h-20 resize-y" name="comment" maxlength="240" placeholder="Their words, in quotes…"></textarea>
          </label>
          <p data-form-error class="hidden text-sm text-red-600 dark:text-red-400" role="alert"></p>
          <button class="btn btn-primary w-full" type="submit">${icons.plus} Add to log</button>
        </div>
      </form>
    </div>
  </section>`;
}

function ratingField(name, label) {
  return `
    <label><span class="label">${label}</span>
      <select class="field" name="${name}">
        ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}" ${n === 3 ? 'selected' : ''}>${n} ${'★'.repeat(n)}</option>`).join('')}
      </select>
    </label>`;
}

function stars(n) {
  return `<span class="tabular-nums" aria-label="${n} out of 5"><span class="text-amber-500">${'★'.repeat(n)}</span><span class="text-line">${'★'.repeat(5 - n)}</span></span>`;
}

function renderLog(main, list) {
  const q = state.query.trim().toLowerCase();
  const rows = list
    .filter((e) => state.filter === 'all' || e.food === state.filter)
    .filter((e) => !q || `${e.tester} ${e.comment} ${foodById[e.food]?.name}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt);

  $('[data-log]', main).innerHTML = rows.length
    ? rows
        .map((e) => {
          const f = foodById[e.food];
          return `
      <tr class="align-top">
        <td class="py-3.5 pr-3">
          <span class="flex items-center gap-2 font-medium"><span class="size-3 shrink-0 rounded-full" style="background:${f.changed}"></span>${esc(f.name)}</span>
        </td>
        <td class="py-3.5 pr-3">
          <span class="font-medium">${esc(e.tester)}</span>
          ${e.sample ? '<span class="ml-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-muted">example</span>' : `<span class="block text-[11px] text-ink-muted">${timeAgo(e.createdAt)}</span>`}
        </td>
        <td class="py-3.5 pr-3 whitespace-nowrap">${stars(e.look)}</td>
        <td class="py-3.5 pr-3 whitespace-nowrap">${stars(e.taste)}</td>
        <td class="py-3.5 pr-3">${differentLabel[e.different]}</td>
        <td class="py-3.5">
          <div class="flex items-start gap-2">
            <span class="text-lg leading-none" aria-hidden="true">${e.reaction}</span>
            <span class="flex-1 text-ink-soft">${e.comment ? `“${esc(e.comment)}”` : '<span class="text-ink-muted">—</span>'}</span>
            ${e.sample ? '' : `<button type="button" class="rounded-md p-1 text-ink-muted transition hover:bg-surface-2 hover:text-red-600" data-delete="${e.id}" aria-label="Delete entry by ${esc(e.tester)}">${icons.trash}</button>`}
          </div>
        </td>
      </tr>`;
        })
        .join('')
    : `<tr><td colspan="6" class="py-10 text-center text-ink-muted">No entries match.</td></tr>`;

  $('[data-log-count]', main).textContent = `Showing ${rows.length} of ${list.length} entries`;
}

function wireLog(main) {
  $$('[data-filter]', main).forEach((btn) =>
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      $$('[data-filter]', main).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderLog(main, allEntries());
    }),
  );
  $('[data-search]', main).addEventListener('input', (e) => {
    state.query = e.target.value;
    renderLog(main, allEntries());
  });

  $('[data-log]', main).addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    save(
      STORE_KEY,
      load(STORE_KEY, []).filter((x) => x.id !== btn.dataset.delete),
    );
    refresh(main);
    toast('Entry removed');
  });

  const form = $('[data-entry-form]', main);
  const error = $('[data-form-error]', form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const tester = String(data.get('tester') || '').trim();
    if (!tester) {
      error.textContent = 'Please add the tester’s name.';
      error.classList.remove('hidden');
      form.tester.focus();
      return;
    }
    error.classList.add('hidden');
    const entry = {
      id: uid(),
      food: data.get('food'),
      tester: tester.slice(0, 30),
      look: Number(data.get('look')),
      taste: Number(data.get('taste')),
      different: data.get('different'),
      reaction: data.get('reaction'),
      comment: String(data.get('comment') || '').trim().slice(0, 240),
      createdAt: Date.now(),
    };
    if (!save(STORE_KEY, [...load(STORE_KEY, []), entry])) {
      toast('Could not save — storage is unavailable in this browser');
      return;
    }
    form.tester.value = '';
    form.comment.value = '';
    refresh(main);
    toast(`Added ${entry.tester}’s reaction`);
  });

  $('[data-export]', main).addEventListener('click', () => {
    const header = ['food', 'tester', 'looks_appetising', 'tastes_good', 'tasted_different', 'reaction', 'comment'];
    const cell = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = allEntries().map((e) =>
      [foodById[e.food].name, e.tester, e.look, e.taste, differentLabel[e.different], e.reaction, e.comment].map(cell).join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    navigator.clipboard
      .writeText(csv)
      .then(() => toast('Copied — paste into Excel or Google Sheets'))
      .catch(() => toast('Copying is blocked here — try another browser'));
  });
}

function evaluation(s) {
  const influenced = s.yes + s.unsure;
  const verdict =
    influenced >= 50
      ? { title: 'Yes — colour changed the experience of taste.', tone: 'Our hypothesis was supported.' }
      : influenced >= 25
        ? { title: 'Partly — colour influenced some people.', tone: 'Our hypothesis was partly supported.' }
        : { title: 'Not really — most people tasted the food as normal.', tone: 'Our hypothesis was not supported.' };
  const gapFood = s.gap?.food;
  const lowFood = s.lowest?.food;

  return `
  <section class="container-page pt-20" aria-labelledby="eval-title">
    <div class="reveal is-visible overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#1e3a8a,#2563eb_45%,#16a34a)] p-1">
      <div class="rounded-[calc(2rem-4px)] bg-surface p-7 sm:p-10">
        <p class="eyebrow">Evaluation</p>
        <h2 id="eval-title" class="mt-3 text-3xl font-semibold sm:text-4xl">Does colour change taste?</h2>
        <p class="mt-4 font-display text-2xl leading-snug text-ink">${verdict.title}</p>
        <div class="mt-8 grid gap-8 lg:grid-cols-3">
          <div>
            <h3 class="font-sans text-base font-semibold">What the data shows</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">
              ${verdict.tone} Although every recipe was unchanged, <strong>${s.yes}%</strong> of testers said the food tasted different and another <strong>${s.unsure}%</strong> were not sure.
              Foods scored an average of <strong>${s.look.toFixed(1)}/5</strong> for appearance but <strong>${s.taste.toFixed(1)}/5</strong> once tasted.
              ${lowFood ? `The least appetising-looking food was <strong>${esc(lowFood.name.toLowerCase())}</strong>.` : ''}
              ${gapFood ? `The biggest surprise was <strong>${esc(gapFood.name.toLowerCase())}</strong>, which tasted much better than it looked.` : ''}
            </p>
          </div>
          <div>
            <h3 class="font-sans text-base font-semibold">Why it happens</h3>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">
              Our brains combine information from all our senses. Colour creates an <em>expectation</em> of flavour before food reaches our mouth — green suggests mint, orange suggests sweetness.
              Scientists have shown this too: in a well-known 2001 study, wine students described white wine dyed red using words normally reserved for red wine.
            </p>
          </div>
          <div>
            <h3 class="font-sans text-base font-semibold">Limitations &amp; next steps</h3>
            <ul class="mt-2 space-y-1.5 text-sm leading-relaxed text-ink-soft">
              <li>• A small group of testers, mostly friends and family.</li>
              <li>• Testers knew the food had been coloured.</li>
              <li>• Next time: a blindfolded control round to compare scores fairly.</li>
            </ul>
          </div>
        </div>
        <div class="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p class="text-sm text-ink-muted">Next: the colourful places of Bahrain.</p>
          <a href="#/blog" class="btn btn-primary">Project 3 · Colour Blog ${icons.arrow}</a>
        </div>
      </div>
    </div>
  </section>`;
}
