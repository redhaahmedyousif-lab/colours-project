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

/**
 * Bilingual project statement: English and Arabic side by side
 * (stacked on phones). `aside` is optional extra markup (e.g. a picture).
 */
export function statement({ eyebrow = 'Project statement', title, en, ar, enHeading = '', arHeading = '', footer = '' }) {
  return `
  <section class="container-page pb-16" aria-labelledby="statement-title">
    <div class="card overflow-hidden">
      <div class="border-b border-line px-6 py-5 sm:px-10">
        <p class="eyebrow">${esc(eyebrow)} · <span lang="ar" class="font-arabic tracking-normal normal-case">بيان المشروع</span></p>
        <h2 id="statement-title" class="mt-2 text-2xl font-semibold sm:text-3xl">${esc(title)}</h2>
      </div>
      <div class="grid md:grid-cols-2">
        <div lang="en" class="min-w-0 p-6 sm:p-10">
          <p class="eyebrow">English</p>
          ${enHeading ? `<h3 class="mt-3 text-xl font-semibold">${esc(enHeading)}</h3>` : ''}
          <p class="mt-3 leading-relaxed text-ink-soft">${esc(en)}</p>
        </div>
        <div lang="ar" dir="rtl" class="min-w-0 border-t border-line bg-surface-2/60 p-6 font-arabic sm:p-10 md:border-t-0 md:border-r">
          <p class="text-xs font-semibold text-ink-muted">العربية</p>
          ${arHeading ? `<h3 class="mt-3 font-arabic text-xl font-semibold">${esc(arHeading)}</h3>` : ''}
          <p class="mt-3 text-[1.05rem] leading-[2.1] text-ink-soft">${esc(ar)}</p>
        </div>
      </div>
      ${footer ? `<div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-10">${footer}</div>` : ''}
    </div>
  </section>`;
}
