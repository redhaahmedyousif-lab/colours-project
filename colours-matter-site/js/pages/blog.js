import { $, $$, esc, icons, timeAgo } from '../lib/dom.js';
import { load, save, uid } from '../lib/storage.js';
import { openModal, toast } from '../lib/ui.js';
import { pageHero, statement } from '../components/sections.js';
import { abstractScene, sceneSvg } from '../components/scenes.js';
import { posts as seedPosts, project, seedComments } from '../data/blog.js';

const KEYS = { posts: 'blog-posts', likes: 'blog-likes', comments: 'blog-comments' };
const state = { mood: 'All', sort: 'latest' };

const allPosts = () => [...load(KEYS.posts, []), ...seedPosts];
const feedPosts = () => allPosts().filter((p) => p.id !== project.postId);
const likedSet = () => new Set(load(KEYS.likes, []));
const userComments = () => load(KEYS.comments, {});
const commentsFor = (id) => [...(seedComments[id] ?? []), ...(userComments()[id] ?? [])].sort((a, b) => a.createdAt - b.createdAt);
const likeCount = (post, liked) => (post.likes ?? 0) + (liked.has(post.id) ? 1 : 0);
const setUrl = (hash) => {
  try {
    history.replaceState(null, '', hash);
  } catch {}
};
const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function media(post, cls = '') {
  if (post.image) {
    return `<img src="${esc(post.image)}" alt="${esc(post.alt || `Photo of ${post.title}`)}" loading="lazy" class="h-full w-full object-cover ${cls}" />`;
  }
  return post.scene ? sceneSvg(post.scene) : abstractScene(post.colours);
}

export function renderBlog(main) {
  state.mood = 'All';
  state.sort = 'latest';
  main.innerHTML = `
    ${pageHero({
      number: 3,
      kicker: 'Colour Blog',
      title: project.title,
      text: 'A community photo blog celebrating the most colourful corners of our island and the feelings they give us. Read the stories, like your favourites and leave a comment.',
      accent: 'from-indigo-500/25 via-amber-300/20 to-transparent',
    })}
    <div data-feature></div>
    <section class="container-page" aria-labelledby="more-places">
      <h2 id="more-places" class="mb-6 text-3xl font-semibold">More colourful places</h2>
    </section>
    <section class="container-page" aria-label="Blog posts">
      <div class="reveal flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
  `;

  $('[data-sort]', main).addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderFeed(main);
  });
  $('[data-share]', main).addEventListener('click', () => openShare(main));
  const onClick = (e) => {
    const like = e.target.closest('[data-like]');
    if (like) {
      e.preventDefault();
      toggleLike(like.dataset.like);
      renderFeed(main);
      renderFeature(main);
      return;
    }
    const open = e.target.closest('[data-open]');
    if (open) openPost(open.dataset.open, main);
  };
  main.addEventListener('click', onClick);

  renderFeature(main);
  renderMoods(main);
  renderFeed(main);

  // Deep link: #/blog?post=manama-souq opens a post directly.
  const id = new URLSearchParams(location.hash.split('?')[1]).get('post');
  if (id && allPosts().some((p) => p.id === id)) openPost(id, main);

  return () => main.removeEventListener('click', onClick);
}

function renderFeature(main) {
  const post = allPosts().find((p) => p.id === project.postId);
  const el = $('[data-feature]', main);
  if (!post || !el) return;
  const liked = likedSet();
  const isLiked = liked.has(post.id);
  const comments = commentsFor(post.id).length;
  el.innerHTML = `
    <section class="container-page pb-6" aria-label="Featured photo">
      <button type="button" data-open="${esc(post.id)}" class="group relative block aspect-[16/9] w-full max-w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-line sm:aspect-[21/9]" aria-label="Open ${esc(post.title)} and its comments">
        <span class="absolute inset-0 block transition duration-700 group-hover:scale-[1.03]">${media(post)}</span>
        <span class="absolute inset-x-0 bottom-0 flex h-2">${post.colours.map((c) => `<span class="flex-1" style="background:${c}"></span>`).join('')}</span>
        <span class="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-900 shadow">★ Featured photo</span>
      </button>
      ${post.credit ? `<p class="mt-2 text-right text-xs text-ink-muted">${esc(post.credit)}</p>` : ''}
    </section>
    ${statement({
      eyebrow: 'Featured post',
      title: project.title,
      enHeading: post.title,
      arHeading: post.titleAr,
      en: post.feeling,
      ar: post.feelingAr,
      footer: `
        <div class="flex items-center gap-1 text-sm">
          <button type="button" data-like="${esc(post.id)}" aria-pressed="${isLiked}" aria-label="${isLiked ? 'Unlike' : 'Like'} ${esc(post.title)}"
            class="${isLiked ? 'is-liked text-rose-600 dark:text-rose-400' : 'text-ink-muted'} inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition hover:bg-surface-2">
            ${icons.heart}<span class="tabular-nums">${likeCount(post, liked)}</span>
          </button>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-ink-muted">${icons.comment}<span class="tabular-nums">${comments}</span></span>
        </div>
        <button type="button" data-open="${esc(post.id)}" class="btn btn-primary">${icons.comment} Leave a comment · <span lang="ar" class="font-arabic">اترك تعليقاً</span></button>`,
    })}`;
}

function renderMoods(main) {
  const moods = ['All', ...new Set(feedPosts().flatMap((p) => p.mood))];
  if (!moods.includes(state.mood)) state.mood = 'All';
  const wrap = $('[data-moods]', main);
  wrap.innerHTML = moods
    .map((m) => `<button type="button" class="chip" data-mood="${esc(m)}" aria-pressed="${m === state.mood}">${esc(m)}</button>`)
    .join('');
  $$('[data-mood]', wrap).forEach((btn) =>
    btn.addEventListener('click', () => {
      state.mood = btn.dataset.mood;
      $$('[data-mood]', wrap).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      renderFeed(main);
    }),
  );
}

function sortedPosts() {
  const liked = likedSet();
  const list = feedPosts().filter((p) => state.mood === 'All' || p.mood.includes(state.mood));
  const by = {
    latest: (a, b) => new Date(b.date) - new Date(a.date),
    loved: (a, b) => likeCount(b, liked) - likeCount(a, liked),
    discussed: (a, b) => commentsFor(b.id).length - commentsFor(a.id).length,
  };
  return list.sort(by[state.sort]);
}

function card(post, liked, featured = false) {
  const isLiked = liked.has(post.id);
  const comments = commentsFor(post.id).length;
  return `
  <article class="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${featured ? 'md:col-span-2 md:flex-row' : ''}">
    <button type="button" data-open="${esc(post.id)}" class="relative block overflow-hidden ${featured ? 'aspect-[16/10] md:aspect-auto md:w-3/5' : 'aspect-[16/10]'}" aria-label="Open ${esc(post.title)}">
      <span class="absolute inset-0 block transition duration-700 group-hover:scale-105">${media(post)}</span>
      <span class="absolute inset-x-0 bottom-0 flex h-1.5">${post.colours.map((c) => `<span class="flex-1" style="background:${c}"></span>`).join('')}</span>
      ${post.userPost ? '<span class="absolute top-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">Community</span>' : ''}
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
          <button type="button" data-like="${esc(post.id)}" aria-pressed="${isLiked}" aria-label="${isLiked ? 'Unlike' : 'Like'} ${esc(post.title)}"
            class="${isLiked ? 'is-liked text-rose-600 dark:text-rose-400' : 'text-ink-muted'} inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition hover:bg-surface-2">
            ${icons.heart}<span class="tabular-nums">${likeCount(post, liked)}</span>
          </button>
          <button type="button" data-open="${esc(post.id)}" class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-muted transition hover:bg-surface-2" aria-label="${comments} comments on ${esc(post.title)}">
            ${icons.comment}<span class="tabular-nums">${comments}</span>
          </button>
        </div>
        <span class="text-xs text-ink-muted">${esc(formatDate(post.date))}</span>
      </div>
    </div>
  </article>`;
}

function renderFeed(main) {
  const list = sortedPosts();
  const liked = likedSet();
  const feed = $('[data-feed]', main);
  if (!list.length) {
    feed.innerHTML = '<p class="card p-10 text-center text-ink-muted">No places match this feeling yet. Why not share one?</p>';
    return;
  }
  const featureFirst = state.mood === 'All' && state.sort === 'latest';
  feed.innerHTML = `<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    ${list.map((p, i) => card(p, liked, featureFirst && i === 0)).join('')}
  </div>`;
}

function toggleLike(id) {
  const liked = likedSet();
  if (liked.has(id)) liked.delete(id);
  else liked.add(id);
  save(KEYS.likes, [...liked]);
}

/* ---------- Post detail + comments ---------- */

function openPost(id, main) {
  const post = allPosts().find((p) => p.id === id);
  if (!post) return;
  setUrl(`#/blog?post=${encodeURIComponent(id)}`);

  const closeModal = openModal({
    title: post.title,
    wide: true,
    render: (body) => {
      body.innerHTML = `
        <div class="relative -mx-5 -mt-6 aspect-[16/8] overflow-hidden sm:-mx-7">${media(post)}</div>
        ${post.credit ? `<p class="mt-2 text-right text-xs text-ink-muted">${esc(post.credit)}</p>` : ''}
        <div class="mt-6 grid gap-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p class="flex items-center gap-1.5 text-sm text-ink-muted">${icons.pin}${esc(post.location)} · ${esc(formatDate(post.date))}</p>
            <div class="mt-3 flex flex-wrap gap-1.5">${post.mood.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
            <h3 class="mt-6 font-sans text-sm font-semibold tracking-wide text-ink-muted uppercase">How it makes me feel</h3>
            <p class="mt-2 font-display text-xl leading-snug">${esc(post.feeling)}</p>
            ${post.feelingAr ? `
            <div lang="ar" dir="rtl" class="mt-6 rounded-2xl bg-surface-2 p-5 font-arabic">
              ${post.titleAr ? `<p class="font-semibold">${esc(post.titleAr)}</p>` : ''}
              <p class="mt-2 leading-[2.1] text-ink-soft">${esc(post.feelingAr)}</p>
            </div>` : ''}
            <h3 class="mt-6 font-sans text-sm font-semibold tracking-wide text-ink-muted uppercase">About the place</h3>
            <p class="mt-2 leading-relaxed text-ink-soft">${esc(post.description)}</p>
            <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
              <span>Posted by ${esc(post.author)}</span>
              ${post.userPost ? `<button type="button" data-delete-post class="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 hover:border-red-400 hover:text-red-600">${icons.trash} Delete post</button>` : ''}
            </div>
          </div>
          <div>
            <h3 class="font-sans text-sm font-semibold tracking-wide text-ink-muted uppercase">Colour palette</h3>
            <div class="mt-3 grid grid-cols-4 gap-2">
              ${post.colours
                .map(
                  (c) => `<div><span class="block aspect-square rounded-xl shadow-inner ring-1 ring-black/5" style="background:${c}"></span>
                  <span class="mt-1 block text-center font-mono text-[10px] text-ink-muted">${c.toUpperCase()}</span></div>`,
                )
                .join('')}
            </div>
          </div>
        </div>
        <section class="mt-10 border-t border-line pt-8" aria-labelledby="comments-title">
          <h3 id="comments-title" class="text-2xl font-semibold">Comments <span data-comment-count class="text-ink-muted"></span></h3>
          <form class="mt-5 grid gap-3 rounded-2xl bg-surface-2 p-4 sm:p-5" data-comment-form novalidate>
            <div class="grid gap-3 sm:grid-cols-[12rem_1fr]">
              <label><span class="sr-only">Your name</span>
                <input class="field" name="name" maxlength="30" placeholder="Your name" autocomplete="nickname" />
              </label>
              <label><span class="sr-only">Your comment</span>
                <textarea class="field min-h-11 resize-y" name="text" maxlength="400" rows="2" placeholder="How does this place make you feel?"></textarea>
              </label>
            </div>
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs text-ink-muted"><span data-chars>0</span>/400 · Be kind and respectful</p>
              <button type="submit" class="btn btn-primary !py-2">Post comment</button>
            </div>
            <p data-comment-error role="alert" class="hidden text-sm text-red-600 dark:text-red-400"></p>
          </form>
          <ul data-comments class="mt-6 space-y-4"></ul>
        </section>`;
      wireComments(body, post);
      $('[data-delete-post]', body)?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        if (btn.dataset.armed !== 'true') {
          btn.dataset.armed = 'true';
          btn.lastChild.textContent = ' Tap again to delete';
          return;
        }
        save(KEYS.posts, load(KEYS.posts, []).filter((p) => p.id !== post.id));
        const all = userComments();
        delete all[post.id];
        save(KEYS.comments, all);
        closeModal();
        renderMoods(main);
        toast('Post deleted');
      });
      return () => {
        // Only tidy the URL if we're still on this post (not navigating away).
        if (location.hash.startsWith('#/blog?post=')) {
          setUrl('#/blog');
          renderFeed(main);
          renderFeature(main);
        }
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
  const count = $('[data-comment-count]', body);
  const form = $('[data-comment-form]', body);
  const error = $('[data-comment-error]', body);
  const chars = $('[data-chars]', body);

  form.name.value = load('commenter', '');

  const render = () => {
    const items = commentsFor(post.id).reverse();
    count.textContent = `(${items.length})`;
    list.innerHTML = items.length
      ? items
          .map(
            (c) => `
        <li class="flex gap-3 animate-fade-up">
          <span class="grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white" style="background:${avatarColour(c.name)}" aria-hidden="true">${esc(c.name.charAt(0).toUpperCase())}</span>
          <div class="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <p class="text-sm font-semibold">${esc(c.name)}</p>
              <div class="flex items-center gap-2 text-xs text-ink-muted">
                <time datetime="${new Date(c.createdAt).toISOString()}">${timeAgo(c.createdAt)}</time>
                ${c.id ? `<button type="button" data-delete-comment="${esc(c.id)}" class="rounded p-0.5 hover:text-red-600" aria-label="Delete your comment">${icons.trash}</button>` : ''}
              </div>
            </div>
            <p class="mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-ink-soft">${esc(c.text)}</p>
          </div>
        </li>`,
          )
          .join('')
      : '<li class="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-muted">No comments yet — be the first to share how this place makes you feel.</li>';
  };

  form.text.addEventListener('input', () => (chars.textContent = form.text.value.length));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const text = form.text.value.trim();
    const fail = (msg, field) => {
      error.textContent = msg;
      error.classList.remove('hidden');
      field.focus();
    };
    if (!name) return fail('Please enter your name.', form.name);
    if (text.length < 2) return fail('Please write a comment.', form.text);
    error.classList.add('hidden');

    const all = userComments();
    all[post.id] = [...(all[post.id] ?? []), { id: uid(), name: name.slice(0, 30), text: text.slice(0, 400), createdAt: Date.now() }];
    if (!save(KEYS.comments, all)) return fail('Sorry, comments can’t be saved in this browser.', form.text);
    save('commenter', name.slice(0, 30));
    form.text.value = '';
    chars.textContent = '0';
    render();
    toast('Thanks for your comment!');
  });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete-comment]');
    if (!btn) return;
    const all = userComments();
    all[post.id] = (all[post.id] ?? []).filter((c) => c.id !== btn.dataset.deleteComment);
    save(KEYS.comments, all);
    render();
    toast('Comment deleted');
  });

  render();
}

/* ---------- Share a place ---------- */

/** Downscale an uploaded photo so it fits comfortably in localStorage. */
function compressImage(file, maxSize = 960, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = Object.assign(document.createElement('canvas'), {
        width: Math.round(img.width * scale),
        height: Math.round(img.height * scale),
      });
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unreadable image'));
    };
    img.src = url;
  });
}

const MOOD_OPTIONS = ['Energetic', 'Peaceful', 'Proud', 'Hopeful', 'Joyful', 'Calm', 'Nostalgic', 'Free', 'Amazed', 'Curious'];

function openShare(main) {
  let photo = null;
  const close = openModal({
    title: 'Share a colourful place',
    render: (body) => {
      body.innerHTML = `
        <form class="grid gap-4" data-share-form novalidate>
          <label class="group relative grid aspect-[16/9] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-surface-2 text-center transition hover:border-ink-muted" data-drop>
            <input type="file" accept="image/*" class="sr-only" name="photo" />
            <span data-photo-preview class="absolute inset-0 hidden"></span>
            <span class="relative grid justify-items-center gap-2 p-4 text-sm text-ink-muted" data-photo-hint>
              ${icons.image}
              <span><strong class="text-ink">Add a photo</strong> (optional)</span>
              <span class="text-xs">No photo? We’ll make art from your colours.</span>
            </span>
          </label>
          <div class="grid gap-4 sm:grid-cols-2">
            <label><span class="label">Place name *</span><input class="field" name="title" maxlength="60" required placeholder="e.g. Isa Town Market" /></label>
            <label><span class="label">Location</span><input class="field" name="location" maxlength="60" placeholder="e.g. Isa Town" /></label>
          </div>
          <label><span class="label">How does it make you feel? *</span>
            <textarea class="field min-h-20" name="feeling" maxlength="300" required placeholder="Describe the colours and the feelings they give you…"></textarea>
          </label>
          <label><span class="label">About the place</span>
            <textarea class="field min-h-16" name="description" maxlength="400" placeholder="A little background for visitors"></textarea>
          </label>
          <fieldset>
            <legend class="label">Its three main colours</legend>
            <div class="flex gap-3">
              ${['#ea580c', '#0f766e', '#facc15']
                .map(
                  (c, i) => `<label class="flex items-center gap-2 rounded-xl border border-line px-2 py-1.5">
                    <input type="color" name="c${i}" value="${c}" class="size-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" aria-label="Colour ${i + 1}" />
                  </label>`,
                )
                .join('')}
            </div>
          </fieldset>
          <fieldset>
            <legend class="label">Feelings (choose up to 3)</legend>
            <div class="flex flex-wrap gap-2">
              ${MOOD_OPTIONS.map((m) => `<button type="button" class="chip" data-pick-mood="${m}" aria-pressed="false">${m}</button>`).join('')}
            </div>
          </fieldset>
          <label><span class="label">Your name *</span><input class="field" name="author" maxlength="30" required placeholder="Your name" /></label>
          <p data-share-error role="alert" class="hidden text-sm text-red-600 dark:text-red-400"></p>
          <button type="submit" class="btn btn-primary">Publish to the blog</button>
          <p class="text-center text-xs text-ink-muted">Posts are saved in this browser.</p>
        </form>`;

      const form = $('[data-share-form]', body);
      const error = $('[data-share-error]', body);
      const preview = $('[data-photo-preview]', body);
      const hint = $('[data-photo-hint]', body);

      form.photo.addEventListener('change', async () => {
        const file = form.photo.files[0];
        if (!file) return;
        try {
          photo = await compressImage(file);
          preview.innerHTML = `<img src="${photo}" alt="Preview of your photo" class="h-full w-full object-cover" />`;
          preview.classList.remove('hidden');
          hint.classList.add('hidden');
        } catch {
          toast('That image could not be read');
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

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = (n) => form[n].value.trim();
        const missing = ['title', 'feeling', 'author'].find((n) => !val(n));
        if (missing) {
          error.textContent = 'Please fill in the fields marked *.';
          error.classList.remove('hidden');
          form[missing].focus();
          return;
        }
        const mood = $$('[data-pick-mood][aria-pressed="true"]', body).map((c) => c.dataset.pickMood);
        const post = {
          id: `community-${uid()}`,
          title: val('title'),
          location: val('location') || 'Kingdom of Bahrain',
          colours: [form.c0.value, form.c1.value, form.c2.value],
          mood: mood.length ? mood : ['Joyful'],
          feeling: val('feeling'),
          description: val('description') || 'Shared by a member of our community.',
          author: val('author'),
          date: new Date().toISOString(),
          likes: 0,
          userPost: true,
          ...(photo ? { image: photo, alt: `Photo of ${val('title')} shared by ${val('author')}` } : {}),
        };
        if (!save(KEYS.posts, [post, ...load(KEYS.posts, [])])) {
          error.textContent = photo
            ? 'The photo is too large to save in this browser. Try a smaller photo or post without one.'
            : 'Sorry, posts can’t be saved in this browser.';
          error.classList.remove('hidden');
          return;
        }
        close();
        state.mood = 'All';
        state.sort = 'latest';
        $('[data-sort]', main).value = 'latest';
        renderMoods(main);
        renderFeed(main);
        toast('Your place is live on the blog!');
      });
    },
  });
}
