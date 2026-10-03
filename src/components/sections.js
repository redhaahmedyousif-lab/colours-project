import { esc, icons } from '../lib/dom.js';

/** Shared hero banner for the project pages. */
export function pageHero({ number, kicker, title, text, accent }) {
  return `
  <section class="relative isolate overflow-hidden">
    <div aria-hidden="true" class="absolute inset-0 -z-10 bg-gradient-to-br ${accent}"></div>
    <div aria-hidden="true" class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--cm-line)_1px,transparent_0)] [background-size:26px_26px] opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>
    <div class="container-page pt-10 pb-14 sm:pt-14 sm:pb-20">
      <a href="#/" class="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-ink">${icons.arrowLeft} All projects</a>
      <div class="mt-8 max-w-3xl animate-fade-up">
        <p class="eyebrow">Project ${number} · ${esc(kicker)}</p>
        <h1 class="mt-4 text-4xl leading-[1.05] font-semibold sm:text-6xl">${esc(title)}</h1>
        <p class="mt-5 text-lg leading-relaxed text-ink-soft">${esc(text)}</p>
      </div>
    </div>
  </section>`;
}
