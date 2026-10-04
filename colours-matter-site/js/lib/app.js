/**
 * Application state and actions.
 *
 *   State   – one store for everything visitors create or notice
 *   Actions – the only code that talks to the backend; each one updates
 *             the store when it finishes (optimistically for likes)
 *   UI      – pages subscribe to the slices they render
 */
import { createStore } from './store.js?v=muu31l0z';
import { backend, failureReason } from './backend.js?v=muu31l0z';
import { load, save } from './storage.js?v=muu31l0z';
import { family } from './palette.js?v=muu31l0z';
import { toast } from './ui.js?v=muu31l0z';

const pendingNote = () =>
  failureReason() === 'offline'
    ? 'You’re offline. Saved on this device. It will be shared automatically when you’re back online.'
    : 'Saved on this device. The server isn’t responding right now, so it will be shared automatically as soon as it is.';
const noteIfPending = (item) => {
  if (item?.pending) toast(pendingNote());
  return item;
};

export const store = createStore({
  mode: backend.mode,
  likes: { counts: {}, mine: [] },
  likesReady: false,
  commentCounts: {},
  comments: {}, // postId → list
  places: [],
  placesReady: false,
  taste: [],
  tasteReady: false,
  seen: load('seen-colours', {}), // colour family → attention score
});

let likesPromise;
let placesPromise;
let tastePromise;
let countsPromise;

export const actions = {
  loadLikes() {
    likesPromise ??= backend
      .loadLikes()
      .then((likes) => store.set({ likes, likesReady: true }))
      .catch(() => store.set({ likesReady: true }));
    return likesPromise;
  },

  async toggleLike(postId) {
    const { likes } = store.get();
    const wasLiked = likes.mine.includes(postId);
    const optimistic = {
      counts: { ...likes.counts, [postId]: Math.max(0, (likes.counts[postId] ?? 0) + (wasLiked ? -1 : 1)) },
      mine: wasLiked ? likes.mine.filter((id) => id !== postId) : [...likes.mine, postId],
    };
    store.set({ likes: optimistic });
    try {
      const { liked, count, pending } = await backend.toggleLike(postId, { wasLiked, count: likes.counts[postId] ?? 0 });
      if (pending) toast(pendingNote());
      const current = store.get().likes;
      store.set({
        likes: {
          counts: { ...current.counts, [postId]: count },
          mine: liked ? [...new Set([...current.mine, postId])] : current.mine.filter((id) => id !== postId),
        },
      });
    } catch (err) {
      store.set({ likes });
      throw err;
    }
  },

  loadCommentCounts() {
    countsPromise ??= backend
      .commentCounts()
      .then((commentCounts) => store.set({ commentCounts }))
      .catch(() => {});
    return countsPromise;
  },

  async loadComments(postId) {
    const list = await backend.listComments(postId).catch(() => []);
    store.set((s) => ({ comments: { ...s.comments, [postId]: list } }));
  },

  async addComment(postId, input) {
    const comment = noteIfPending(await backend.addComment(postId, input));
    store.set((s) => ({
      comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), comment] },
      commentCounts: { ...s.commentCounts, [postId]: (s.commentCounts[postId] ?? 0) + 1 },
    }));
    return comment;
  },

  async deleteComment(postId, id) {
    await backend.deleteComment(postId, id);
    store.set((s) => ({
      comments: { ...s.comments, [postId]: (s.comments[postId] ?? []).filter((c) => c.id !== id) },
      commentCounts: { ...s.commentCounts, [postId]: Math.max(0, (s.commentCounts[postId] ?? 1) - 1) },
    }));
  },

  loadPlaces() {
    placesPromise ??= backend
      .listPlaces()
      .then((places) => store.set({ places, placesReady: true }))
      .catch(() => store.set({ placesReady: true }));
    return placesPromise;
  },

  async addPlace(place, photo) {
    const post = noteIfPending(await backend.addPlace(place, photo));
    store.set((s) => ({ places: [post, ...s.places] }));
    return post;
  },

  async deletePlace(id) {
    await backend.deletePlace(id);
    store.set((s) => ({ places: s.places.filter((p) => p.id !== id) }));
  },

  loadTaste() {
    tastePromise ??= backend
      .listTaste()
      .then((taste) => store.set({ taste, tasteReady: true }))
      .catch(() => store.set({ tasteReady: true }));
    return tastePromise;
  },

  async addTaste(entry) {
    const saved = noteIfPending(await backend.addTaste(entry));
    store.set((s) => ({ taste: [...s.taste, saved] }));
    return saved;
  },

  async deleteTaste(id) {
    await backend.deleteTaste(id);
    store.set((s) => ({ taste: s.taste.filter((e) => e.id !== id) }));
  },

  /** Record that the visitor paid attention to some colours (drives "next discovery"). */
  notice(hexes, weight = 1) {
    const seen = { ...store.get().seen };
    for (const hex of [hexes].flat()) {
      const f = family(hex);
      if (f === 'grey') continue;
      seen[f] = Math.round(((seen[f] ?? 0) + weight) * 10) / 10;
    }
    save('seen-colours', seen);
    store.set({ seen });
  },
};

/** The colour family this visitor has noticed most, if any. */
export function favouriteFamily() {
  const entries = Object.entries(store.get().seen).sort((a, b) => b[1] - a[1]);
  return entries.length && entries[0][1] >= 1 ? entries[0][0] : null;
}

/** After queued offline items reach the server, reload shared data. */
backend.onSync?.((sent) => {
  likesPromise = placesPromise = tastePromise = countsPromise = null;
  const { comments } = store.get();
  actions.loadLikes();
  actions.loadCommentCounts();
  if (store.get().placesReady) actions.loadPlaces();
  if (store.get().tasteReady) actions.loadTaste();
  Object.keys(comments).forEach((id) => actions.loadComments(id));
  toast(sent === 1 ? 'Back online. Your saved item has been shared.' : `Back online. ${sent} saved items have been shared.`);
});
