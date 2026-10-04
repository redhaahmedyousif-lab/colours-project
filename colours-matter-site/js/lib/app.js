/**
 * Application state and actions.
 *
 *   State   – one store for everything visitors create or notice
 *   Actions – the only code that talks to the backend; each one updates
 *             the store when it finishes (optimistically for likes)
 *   UI      – pages subscribe to the slices they render
 */
import { createStore } from './store.js?v=muu1oee4';
import { backend } from './backend.js?v=muu1oee4';
import { load, save } from './storage.js?v=muu1oee4';
import { family } from './palette.js?v=muu1oee4';

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
      const { liked, count } = await backend.toggleLike(postId);
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
    const comment = await backend.addComment(postId, input);
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
    const post = await backend.addPlace(place, photo);
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
    const saved = await backend.addTaste(entry);
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
