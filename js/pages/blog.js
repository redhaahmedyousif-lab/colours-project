import { $, $$, esc, icons, timeAgo } from '../lib/dom.js?v=muu24ax7';
import { load, save } from '../lib/storage.js?v=muu24ax7';
import { openModal, toast } from '../lib/ui.js?v=muu24ax7';
import { actions, store } from '../lib/app.js?v=muu24ax7';
import { cleanText, isHex, rateLimit, reencode, validateImage, blobToDataUrl, IMAGE_RULES } from '../lib/sanitize.js?v=muu24ax7';
import { extractPalette, readMood } from '../lib/palette.js?v=muu24ax7';
import { animateStats } from '../lib/motion.js?v=muu24ax7';
import { pageHero, statement } from '../components/sections.js?v=muu24ax7';
import { abstractScene, sceneSvg } from '../components/scenes.js?v=muu24ax7';
import { mountMap } from '../components/map.js?v=muu24ax7';
import { mountDiscovery } from '../components/discovery.js?v=muu24ax7';
import { posts as seedPosts, project, seedComments } from '../data/blog.js?v=muu24ax7';

const view = { mood: 'All', sort: 'latest' };
const MOOD_OPTIONS = ['Energetic', 'Peaceful', 'Proud', 'Hopeful', 'Joyful', 'Calm', 'Nostalgic', 'Free', 'Amazed', 'Curious', 'Awe', 'Tranquil'];

const allPosts = () => [...store.get().places, ...seedPosts];
const feedPosts = () => allPosts().filter((p) => p.id !== project.postId);
const likeCount = (post) => (post.likes ?? 0) + (store.get().likes.counts[post.id] ?? 0);
const isLiked = (id) => store.get().likes.mine.includes(id);
const commentCount = (id) => (seedComments[id]?.length ?? 0) + (store.get().commentCounts[id] ?? 0);
const commentsFor = (id) => [...(seedComments[id] ?? []), ...(store.get().comments[id] ?? [])].sort((a, b) => a.createdAt - b.createdAt);
const setUrl = (hash) => {
  try {
    history.replaceState(null, '', hash);
  } catch {}
};
const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const params = () => new URLSearchParams(location.hash.split('?')[1]);

function media(post, { priority = false } = {}) {
  if (post.image) {
    const size = post.width && post.height ? `width="${post.width}" height="${post.height}"` : '';
    const loading = priority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    return `<img src="${esc(post.image)}" alt="${esc(post.alt || `Photo of ${post.title}`)}" ${size} ${loading} decoding="async" class="h-full w-full object-cover" />`;
  }
  return post.scene ? sceneSvg(post.scene) : abstractScene(post.colours);
}

function likeButton(post) {
  const liked = isLiked(post.id);
  return `
    <button type="button" data-like="${esc(post.id)}" aria-pressed="${liked}" aria-label="${liked ? 'Unlike' : 'Like'} ${esc(post.title)}"
      class="like-btn ${liked ? 'is-liked text-rose-600 dark:text-rose-400' : 'text-ink-muted'} inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition hover:bg-surface-2">
      ${icons.heart}<span class="tabular-nums" data-like-count>${likeCount(post)}</span>
    </button>`;
}

/* ---------------- Page ---------------- */

export function renderBlog(main) {
  view.mood = 'All';
  view.sort = 'latest';
  const focus = params().get('focus');

  main.innerHTML = `
    ${pageHero({
      number: 3,
      kicker: 'Colour Blog',
      title: project.title,
      text: 'A community photo blog celebrating the most colourful corners of our island and the feelings they give us. Read the stories, like your favourites and leave a comment.',
      accent: 'from-indigo-500/25 via-amber-300/20 to-transparent',
    })}
    <div data-feature></div>

    <section class="container-page py-16" aria-labelledby="map-title" id="colour-map">
      <div class="max-w-2xl">
        <p class="eyebrow">Bahrain colour map</p>
        <h2 id="map-title" class="mt-3 text-4xl font-semibold">Every place has a palette</h2>
      </div>
      <div class="mt-10" data-map></div>
    </section>

    <section class="container-page cv-auto pb-16" aria-labelledby="lab-title">
      <div class="card grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div class="p-6 sm:p-10">
          <p class="eyebrow">Palette lab</p>
          <h2 id="lab-title" class="mt-3 text-3xl font-semibold">What colours does your photo feel like?</h2>
          <label class="palette-drop mt-6" data-lab-drop>
            <input type="file" accept="${IMAGE_RULES.types.join(',')}" class="sr-only" data-lab-input />
            <span class="flex items-center gap-3 text-sm text-ink-muted">${icons.image}<span><strong class="text-ink">Choose a photo</strong> or drop it here</span></span>
            <span class="text-xs text-ink-muted">JPG, PNG or WebP · up to 8 MB · stays on your device</span>
          </label>
          <p data-lab-error role="alert" class="mt-3 hidden text-sm text-red-600 dark:text-red-400"></p>
        </div>
        <div class="relative min-h-[18rem] border-t border-line bg-surface-2/50 p-6 sm:p-10 lg:border-t-0 lg:border-l" data-lab-result>
          <div class="flex h-full flex-col justify-center gap-3" aria-hidden="true">
            ${['#9a5b34', '#0f766e', '#fbbf24', '#0b1026', '#e9d8b8']
              .map((c, i) => `<span class="h-6 rounded-full opacity-25" style="background:${c};width:${90 - i * 14}%"></span>`)
              .join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="container-page cv-auto" aria-labelledby="more-places">
      <h2 id="more-places" class="mb-6 text-3xl font-semibold">More colourful places</h2>
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter by feeling" data-moods></div>
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-sm text-ink-muted">Sort
            <select class="field !w-auto !py-2" data-sort>
              <option value="latest">Latest</option>
              <option value="loved">Most loved</option>
              <option value="discussed">Most discussed</option>
            </select>
          </label>
          <button type="button" class="btn btn-primary shrink-0 whitespace-nowrap" data-share>${icons.plus} Share a place</button>
        </div>
      </div>
      <div data-feed class="mt-8"></div>
    </section>

    <section class="container-page pt-16"><div data-discovery></div></section>
  `;

  renderFeature(main);
  mountMap($('[data-map]', main), { focus });
  if (focus) requestAnimationFrame(() => $('#colour-map', main)?.scrollIntoView({ block: 'start' }));
  wireLab(main);

  $('[data-sort]', main).addEventListener('change', (e) => {
    view.sort = e.target.value;
    renderFeed(main);
  });
  $('[data-share]', main).addEventListener('click', () => openShare(main));

  const onClick = (e) => {
    const like = e.target.closest('[data-like]');
    if (like) {
      e.preventDefault();
      actions.toggleLike(like.dataset.like).catch((err) => toast(err.message));
      return;
    }
    const open = e.target.closest('[data-open], [data-map-open]');
    if (open) {
      e.preventDefault();
      openPost(open.dataset.open ?? open.dataset.mapOpen, main);
    }
  };
  main.addEventListener('click', onClick);

  // State → UI: each subscription updates only what it owns.
  const stops = [
    store.subscribe((s) => s.likes, () => updateLikes(main)),
    store.subscribe((s) => s.commentCounts, () => updateCommentCounts(main)),
    store.subscribe((s) => s.places, () => {
      renderMoods(main);
      renderFeed(main);
    }),
    mountDiscovery($('[data-discovery]', main), '/blog'),
    animateStats(main),
    () => main.removeEventListener('click', onClick),
  ];
  actions.loadLikes();
  actions.loadCommentCounts();
  actions.loadPlaces();

  // Deep link: #/blog?post=manama-souq opens a post directly.
  const id = params().get('post');
  if (id) actions.loadPlaces().then(() => allPosts().some((p) => p.id === id) && openPost(id, main));

  return () => stops.forEach((s) => s());
}

function updateLikes(root) {
  $$('[data-like]', root).forEach((btn) => {
    const post = allPosts().find((p) => p.id === btn.dataset.like);
    if (!post) return;
    const liked = isLiked(post.id);
    btn.setAttribute('aria-pressed', String(liked));
    btn.setAttribute('aria-label', `${liked ? 'Unlike' : 'Like'} ${post.title}`);
    btn.classList.toggle('is-liked', liked);
    btn.classList.toggle('text-rose-600', liked);
    btn.classList.toggle('dark:text-rose-400', liked);
    btn.classList.toggle('text-ink-muted', !liked);
    $('[data-like-count]', btn).textContent = likeCount(post);
  });
}

function updateCommentCounts(root) {
  $$('[data-comment-count-for]', root).forEach((el) => (el.textContent = commentCount(el.dataset.commentCountFor)));
}

function renderFeature(main) {
  const post = seedPosts.find((p) => p.id === project.postId);
  const el = $('[data-feature]', main);
  if (!post || !el) return;
  el.innerHTML = `
    <section class="container-page pb-6" aria-label="Featured photo">
      <button type="button" data-open="${esc(post.id)}" class="group relative block aspect-[16/9] w-full max-w-full overflow-hidden rounded-[2rem] bg-[#0b1026] shadow-2xl ring-1 ring-line sm:aspect-[21/9]" aria-label="Open ${esc(post.title)} and its comments">
        <span class="absolute inset-0 block transition duration-700 group-hover:scale-[1.03]">${media(post, { priority: true })}</span>
        <span class="absolute inset-x-0 bottom-0 flex h-2">${post.colours.map((c) => `<span class="flex-1" style="background:${c}"></span>`).join('')}</span>
        <span class="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-900 shadow">★ Featured photo</span>
      </button>
      ${post.credit ? `<p class="mt-2 text-right text-xs text-ink-muted">${esc(post.credit)}</p>` : ''}
    </section>
    ${statement({
      eyebrow: 'Featured post',
      title: project.title,
      heading: post.title,
      en: post.feeling,
      footer: `
        <div class="flex items-center gap-1 text-sm">
          ${likeButton(post)}
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-ink-muted">${icons.comment}<span class="tabular-nums" data-comment-count-for="${esc(post.id)}">${commentCount(post.id)}</span></span>
        </div>
        <button type="button" data-open="${esc(post.id)}" class="btn btn-primary">${icons.comment} Leave a comment</button>`,
    })}`;
}

function renderMoods(main) {
  const moods = ['All', ...new Set(feedPosts().flatMap((p) => p.mood))];
  if (!moods.includes(view.mood)) view.mood = 'All';
  const wrap = $('[data-moods]', main);
  wrap.innerHTML = moods.map((m) => `<button type="button" class="chip" data-mood="${esc(m)}" aria-pressed="${m === view.mood}">${esc(m)}</button>`).join('');
  $$('[data-mood]', wrap).forEach((btn) =>
    btn.addEventListener('click', () => {
      view.mood = btn.dataset.mood;
      $$('[data-mood]', wrap).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderFeed(main);
    }),
  );
}

function sortedPosts() {
  const list = feedPosts().filter((p) => view.mood === 'All' || p.mood.includes(view.mood));
  const by = {
    latest: (a, b) => new Date(b.date) - new Date(a.date),
    loved: (a, b) => likeCount(b) - likeCount(a),
    discussed: (a, b) => commentCount(b.id) - commentCount(a.id),
  };
  return list.sort(by[view.sort]);
}

function card(post, featured = false) {
  return `
  <article class="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${featured ? 'md:col-span-2 md:flex-row' : ''}">
    <button type="button" data-open="${esc(post.id)}" class="relative block overflow-hidden ${featured ? 'aspect-[16/10] md:aspect-auto md:w-3/5' : 'aspect-[16/10]'}" aria-label="Open ${esc(post.title)}">
      <span class="absolute inset-0 block transition duration-700 group-hover:scale-105">${media(post)}</span>
      <span class="palette-strip absolute inset-x-0 bottom-0 flex">${post.colours
        .map((c) => `<span class="flex-1" style="background:${c}"><span class="palette-strip-hex">${c.toUpperCase()}</span></span>`)
        .join('')}</span>
      ${post.userPost ? `<span class="absolute top-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">${post.pending ? 'Waiting to send' : 'Community'}</span>` : ''}
      ${featured ? '<span class="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-900 shadow">★ Featured place</span>' : ''}
    </button>
    <div class="flex flex-1 flex-col p-6 ${featured ? 'md:p-8' : ''}">
      <p class="flex items-center gap-1.5 text-xs text-ink-muted">${icons.pin}${esc(post.location)}</p>
      <h3 class="mt-2 ${featured ? 'text-3xl' : 'text-xl'} font-semibold">
        <button type="button" data-open="${esc(post.id)}" class="text-left hover:underline">${esc(post.title)}</button>
      </h3>
      <div class="mt-3 flex flex-wrap gap-1.5">${post.mood.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
      <p class="mt-4 flex-1 text-sm leading-relaxed text-ink-soft ${featured ? '' : 'line-clamp-4'}">${esc(post.feeling)}</p>
      <div class="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
        <div class="flex items-center gap-1">
          ${likeButton(post)}
          <button type="button" data-open="${esc(post.id)}" class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-muted transition hover:bg-surface-2" aria-label="Comments on ${esc(post.title)}">
            ${icons.comment}<span class="tabular-nums" data-comment-count-for="${esc(post.id)}">${commentCount(post.id)}</span>
          </button>
        </div>
        <span class="text-xs text-ink-muted">${esc(formatDate(post.date))}</span>
      </div>
    </div>
  </article>`;
}

function renderFeed(main) {
  const list = sortedPosts();
  const feed = $('[data-feed]', main);
  if (!list.length) {
    feed.innerHTML = '<p class="card p-10 text-center text-ink-muted">No places match this feeling yet. Why not share one?</p>';
    return;
  }
  const featureFirst = view.mood === 'All' && view.sort === 'latest';
  feed.innerHTML = `<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">${list.map((p, i) => card(p, featureFirst && i === 0)).join('')}</div>`;
}

/* ---------------- Post detail + comments ---------------- */

function openPost(id, main) {
  const post = allPosts().find((p) => p.id === id);
  if (!post) return;
  setUrl(`#/blog?post=${encodeURIComponent(id)}`);
  actions.notice(post.colours, 0.5);

  const closeModal = openModal({
    title: post.title,
    wide: true,
    render: (body) => {
      body.innerHTML = `
        <div class="relative -mx-5 -mt-6 aspect-[16/8] overflow-hidden bg-surface-2 sm:-mx-7">${media(post)}</div>
        ${post.credit ? `<p class="mt-2 text-right text-xs text-ink-muted">${esc(post.credit)}</p>` : ''}
        <div class="mt-6 grid gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p class="flex items-center gap-1.5 text-sm text-ink-muted">${icons.pin}${esc(post.location)} · ${esc(formatDate(post.date))}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">${post.mood.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
            <h3 class="mt-6 font-sans text-sm font-semibold tracking-wide text-ink-muted uppercase">How it makes me feel</h3>
            <p class="mt-2 font-display text-xl leading-snug">${esc(post.feeling)}</p>
            <h3 class="mt-6 font-sans text-sm font-semibold tracking-wide text-ink-muted uppercase">About the place</h3>
            <p class="mt-2 leading-relaxed text-ink-soft">${esc(post.description)}</p>
            <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <span>Posted by ${esc(post.author)}</span>
              ${post.userPost && post.own && (store.get().mode === 'local' || post.pending) ? `<button type="button" data-delete-post class="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 hover:border-red-400 hover:text-red-600">${icons.trash} <span>Delete post</span></button>` : ''}
            </div>
          </div>
          <div>
            <h3 class="font-sans text-sm font-semibold tracking-wide text-ink-muted uppercase">Colour palette</h3>
            <div class="mt-3 flex h-16 overflow-hidden rounded-xl ring-1 ring-black/5">
              ${post.colours.map((c) => `<span class="map-swatch relative flex-1" style="background:${c}" tabindex="0"><span class="map-hex">${c.toUpperCase()}</span></span>`).join('')}
            </div>
          </div>
        </div>
        <section class="mt-10 border-t border-line pt-8" aria-labelledby="comments-title">
          <h3 id="comments-title" class="text-2xl font-semibold">Comments <span data-comment-total class="text-ink-muted"></span></h3>
          <form class="mt-5 grid gap-3 rounded-2xl bg-surface-2 p-4 sm:p-5" data-comment-form novalidate>
            <div class="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <label><span class="sr-only">Your name</span>
                <input class="field" id="comment-name" name="name" maxlength="30" placeholder="Your name" autocomplete="nickname" />
              </label>
              <label><span class="sr-only">Your comment</span>
                <textarea class="field min-h-11 resize-y" id="comment-text" name="text" maxlength="400" rows="2" placeholder="How does this place make you feel?"></textarea>
              </label>
            </div>
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs text-ink-muted"><span data-chars>0</span>/400 · Be kind and respectful</p>
              <button type="submit" class="btn btn-primary !py-2">Post comment</button>
            </div>
            <p data-comment-error role="alert" class="hidden text-sm text-red-600 dark:text-red-400"></p>
          </form>
          <ul data-comments class="mt-6 space-y-4"><li class="h-16 animate-pulse rounded-2xl bg-surface-2"></li></ul>
        </section>`;

      const stopComments = wireComments(body, post);
      $('[data-delete-post]', body)?.addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        if (btn.dataset.armed !== 'true') {
          btn.dataset.armed = 'true';
          btn.lastElementChild.textContent = 'Tap again to delete';
          return;
        }
        try {
          await actions.deletePlace(post.id);
          closeModal();
          toast('Post deleted');
        } catch (err) {
          toast(err.message);
        }
      });
      return () => {
        stopComments();
        // Only tidy the URL if we're still on this post (not navigating away).
        if (location.hash.startsWith('#/blog?post=')) setUrl('#/blog');
      };
    },
  });
}

const avatarColour = (name) => {
  const palette = ['#0f766e', '#9a5b34', '#2563eb', '#ce1126', '#7c3aed', '#d97706', '#0e7490'];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
};

function wireComments(body, post) {
  const list = $('[data-comments]', body);
  const total = $('[data-comment-total]', body);
  const form = $('[data-comment-form]', body);
  const error = $('[data-comment-error]', body);
  const chars = $('[data-chars]', body);
  const canDelete = (c) => c.own && !c.remote;
  // (pending offline comments can be deleted before they are sent)
  form.name.value = load('commenter', '');

  const render = () => {
    const items = commentsFor(post.id).reverse();
    total.textContent = `(${items.length})`;
    list.innerHTML = items.length
      ? items
          .map(
            (c) => `
        <li class="flex gap-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white" style="background:${avatarColour(c.name)}" aria-hidden="true">${esc(c.name.charAt(0).toUpperCase())}</span>
          <div class="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-sm font-semibold">${esc(c.name)}</p>
              <div class="flex items-center gap-2 text-xs text-ink-muted">
                ${c.pending ? '<span class="pending-chip">Waiting to send</span>' : `<time datetime="${new Date(c.createdAt).toISOString()}">${timeAgo(c.createdAt)}</time>`}
                ${canDelete(c) ? `<button type="button" data-delete-comment="${esc(c.id)}" class="rounded p-0.5 hover:text-red-600" aria-label="Delete your comment">${icons.trash}</button>` : ''}
              </div>
            </div>
            <p class="mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-ink-soft">${esc(c.text)}</p>
          </div>
        </li>`,
          )
          .join('')
      : '<li class="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">No comments yet. Be the first to share how this place makes you feel.</li>';
  };

  form.text.addEventListener('input', () => (chars.textContent = form.text.value.length));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fail = (msg, field) => {
      error.textContent = msg;
      error.classList.remove('hidden');
      field?.focus();
    };
    const name = cleanText(form.name.value, 30);
    const text = cleanText(form.text.value, 400);
    if (!name) return fail('Please enter your name.', form.name);
    if (text.length < 2) return fail('Please write a comment.', form.text);
    const wait = rateLimit('comment', { max: 3, windowMs: 60_000, minGapMs: 8_000 });
    if (wait) return fail(`You’re commenting quickly. Please wait ${wait} seconds.`, form.text);
    error.classList.add('hidden');

    const submit = $('button[type=submit]', form);
    submit.disabled = true;
    try {
      const added = await actions.addComment(post.id, { name, text });
      save('commenter', name);
      form.text.value = '';
      chars.textContent = '0';
      if (!added.pending) toast('Thanks for your comment!');
    } catch (err) {
      fail(err.message, form.text);
    } finally {
      submit.disabled = false;
    }
  });

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-delete-comment]');
    if (!btn) return;
    try {
      await actions.deleteComment(post.id, btn.dataset.deleteComment);
      toast('Comment deleted');
    } catch (err) {
      toast(err.message);
    }
  });

  const stop = store.subscribe((s) => s.comments[post.id], render, { immediate: false });
  actions.loadComments(post.id).then(render);
  return stop;
}

/* ---------------- Palette lab + photo handling ---------------- */

/** Validate, clean and analyse a photo. Returns { blob, dataUrl, width, height, palette, mood }. */
async function processPhoto(file) {
  const bitmap = await validateImage(file);
  const blob = await reencode(bitmap);
  const palette = extractPalette(bitmap, 5);
  const clean = await createImageBitmap(blob);
  const result = { blob, dataUrl: await blobToDataUrl(blob), width: clean.width, height: clean.height, palette, mood: readMood(palette) };
  bitmap.close?.();
  clean.close?.();
  return result;
}

function paletteResult(photo) {
  return `
    <div class="grid gap-5 animate-fade-up">
      <div class="aspect-[16/9] overflow-hidden rounded-2xl bg-surface-2"><img src="${photo.dataUrl}" alt="Your photo" class="h-full w-full object-cover" /></div>
      <div class="flex h-14 overflow-hidden rounded-xl ring-1 ring-black/5">
        ${photo.palette
          .map((c) => `<span class="map-swatch relative" style="background:${c.hex};flex-grow:${Math.max(0.6, c.share * 5).toFixed(2)}" tabindex="0"><span class="map-hex">${c.hex.toUpperCase()}</span></span>`)
          .join('')}
      </div>
      <div>
        <div class="flex flex-wrap gap-1.5">${photo.mood.moods.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
        <p class="mt-3 font-display text-xl leading-snug">${esc(photo.mood.summary)}</p>
      </div>
      <button type="button" class="btn btn-primary justify-self-start" data-lab-share>${icons.plus} Share this place</button>
    </div>`;
}

function wireLab(main) {
  const drop = $('[data-lab-drop]', main);
  const input = $('[data-lab-input]', main);
  const out = $('[data-lab-result]', main);
  const error = $('[data-lab-error]', main);
  let photo = null;

  const handle = async (file) => {
    error.classList.add('hidden');
    out.setAttribute('aria-busy', 'true');
    try {
      photo = await processPhoto(file);
      out.innerHTML = paletteResult(photo);
      actions.notice(photo.palette.map((c) => c.hex), 0.8);
      $('[data-lab-share]', out).addEventListener('click', () => openShare(main, photo));
    } catch (err) {
      error.textContent = err.message;
      error.classList.remove('hidden');
    } finally {
      out.removeAttribute('aria-busy');
      input.value = '';
    }
  };

  input.addEventListener('change', () => input.files[0] && handle(input.files[0]));
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('is-over');
    const file = e.dataTransfer.files[0];
    if (file) handle(file);
  });
}

/* ---------------- Share a place ---------------- */

function openShare(main, preset = null) {
  let photo = preset;
  const defaults = preset?.palette?.map((c) => c.hex) ?? ['#ea580c', '#0f766e', '#facc15', '#0b1026', '#e9d8b8'];
  const presetMoods = new Set(preset?.mood?.moods ?? []);

  const close = openModal({
    title: 'Share a colourful place',
    render: (body) => {
      body.innerHTML = `
        <form class="grid gap-4" data-share-form novalidate>
          <label class="group relative grid aspect-[16/9] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-surface-2 text-center transition hover:border-ink-muted">
            <input type="file" accept="${IMAGE_RULES.types.join(',')}" class="sr-only" name="photo" id="share-photo" />
            <span data-photo-preview class="absolute inset-0 ${photo ? '' : 'hidden'}">${photo ? `<img src="${photo.dataUrl}" alt="Preview of your photo" class="h-full w-full object-cover" />` : ''}</span>
            <span class="relative grid justify-items-center gap-2 p-4 text-sm text-ink-muted ${photo ? 'hidden' : ''}" data-photo-hint>
              ${icons.image}
              <span><strong class="text-ink">Add a photo</strong> (optional)</span>
              <span class="text-xs">We’ll read its colours for you. JPG, PNG or WebP, up to 8 MB.</span>
            </span>
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label><span class="label">Place name *</span><input class="field" id="share-title" name="title" maxlength="60" required placeholder="e.g. Isa Town Market" /></label>
            <label><span class="label">Location</span><input class="field" id="share-location" name="location" maxlength="60" placeholder="e.g. Isa Town" /></label>
          </div>
          <label><span class="label">How does it make you feel? *</span>
            <textarea class="field min-h-20" id="share-feeling" name="feeling" maxlength="300" required placeholder="Describe the colours and the feelings they give you…"></textarea>
          </label>
          <label><span class="label">About the place</span>
            <textarea class="field min-h-16" id="share-description" name="description" maxlength="400" placeholder="A little background for visitors"></textarea>
          </label>
          <fieldset>
            <legend class="label">Its colours</legend>
            <div class="flex flex-wrap gap-2" data-colour-inputs>
              ${defaults
                .map(
                  (c, i) => `<label class="rounded-xl border border-line p-1.5">
                    <input type="color" id="share-c${i}" name="c${i}" value="${c}" class="block size-9 cursor-pointer rounded-lg border-0 bg-transparent p-0" aria-label="Colour ${i + 1}" />
                  </label>`,
                )
                .join('')}
            </div>
          </fieldset>
          <fieldset>
            <legend class="label">Feelings (choose up to 3)</legend>
            <div class="flex flex-wrap gap-2">
              ${MOOD_OPTIONS.map((m) => `<button type="button" class="chip" data-pick-mood="${m}" aria-pressed="${presetMoods.has(m)}">${m}</button>`).join('')}
            </div>
          </fieldset>
          <label><span class="label">Your name *</span><input class="field" id="share-author" name="author" maxlength="30" required placeholder="Your name" /></label>
          <p data-share-error role="alert" class="hidden text-sm text-red-600 dark:text-red-400"></p>
          <button type="submit" class="btn btn-primary">Publish to the blog</button>
          <p class="text-center text-xs text-ink-muted">${store.get().mode === 'local' ? 'Posts are saved in this browser.' : 'Posts are shared with everyone who visits.'}</p>
        </form>`;

      const form = $('[data-share-form]', body);
      const error = $('[data-share-error]', body);
      const preview = $('[data-photo-preview]', body);
      const hint = $('[data-photo-hint]', body);
      const showError = (msg, field) => {
        error.textContent = msg;
        error.classList.remove('hidden');
        field?.focus();
      };

      form.photo.addEventListener('change', async () => {
        const file = form.photo.files[0];
        if (!file) return;
        error.classList.add('hidden');
        try {
          photo = await processPhoto(file);
          preview.innerHTML = `<img src="${photo.dataUrl}" alt="Preview of your photo" class="h-full w-full object-cover" />`;
          preview.classList.remove('hidden');
          hint.classList.add('hidden');
          photo.palette.forEach((c, i) => form[`c${i}`] && (form[`c${i}`].value = c.hex));
          const suggested = new Set(photo.mood.moods);
          $$('[data-pick-mood]', body).forEach((chip) => chip.setAttribute('aria-pressed', String(suggested.has(chip.dataset.pickMood))));
        } catch (err) {
          photo = null;
          form.photo.value = '';
          showError(err.message);
        }
      });

      $$('[data-pick-mood]', body).forEach((chip) =>
        chip.addEventListener('click', () => {
          const on = chip.getAttribute('aria-pressed') === 'true';
          const picked = $$('[data-pick-mood][aria-pressed="true"]', body).length;
          if (!on && picked >= 3) return toast('Choose up to 3 feelings');
          chip.setAttribute('aria-pressed', String(!on));
        }),
      );

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const val = (n, max) => cleanText(form[n].value, max);
        const place = {
          title: val('title', 60),
          location: val('location', 60) || 'Kingdom of Bahrain',
          feeling: val('feeling', 300),
          description: val('description', 400) || 'Shared by a member of our community.',
          author: val('author', 30),
          colours: $$('input[type=color]', form).map((i) => i.value.toLowerCase()).filter(isHex),
          mood: $$('[data-pick-mood][aria-pressed="true"]', body).map((c) => c.dataset.pickMood).slice(0, 3),
        };
        const missing = ['title', 'feeling', 'author'].find((n) => !place[n]);
        if (missing) return showError('Please fill in the fields marked *.', form[missing]);
        if (place.colours.length < 3) return showError('Please choose at least three colours.');
        if (!place.mood.length) place.mood = ['Joyful'];
        const wait = rateLimit('place', { max: 3, windowMs: 3_600_000, minGapMs: 20_000 });
        if (wait) return showError(`You’ve shared a lot recently. Please wait ${Math.ceil(wait / 60)} minute(s).`);

        const submit = $('button[type=submit]', form);
        submit.disabled = true;
        submit.textContent = 'Publishing…';
        try {
          const added = await actions.addPlace(place, photo);
          close();
          view.mood = 'All';
          view.sort = 'latest';
          $('[data-sort]', main).value = 'latest';
          if (!added?.pending) toast('Your place is live on the blog!');
        } catch (err) {
          showError(err.message);
          submit.disabled = false;
          submit.textContent = 'Publish to the blog';
        }
      });
    },
  });
}
