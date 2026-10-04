/**
 * Data layer. One interface, two implementations:
 *   - Supabase (shared by all visitors) when src/data/config.js has keys
 *   - localStorage (this browser only) otherwise
 *
 * Supabase is reached with plain fetch() calls to its REST API, so no client
 * library is loaded. All writes go through Postgres functions that validate
 * input and apply rate limits (see supabase/schema.sql).
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../data/config.js';
import { load, save, uid } from './storage.js';

export const clientId = (() => {
  let id = load('client-id', '');
  if (!/^[\w-]{8,64}$/.test(id)) {
    id = uid();
    save('client-id', id);
  }
  return id;
})();

/* ---------------- Local (browser) ---------------- */

const KEYS = { posts: 'blog-posts', likes: 'blog-likes', comments: 'blog-comments', taste: 'taste-entries' };

const local = {
  mode: 'local',

  async loadLikes() {
    const mine = load(KEYS.likes, []);
    return { counts: Object.fromEntries(mine.map((id) => [id, 1])), mine };
  },
  async toggleLike(postId) {
    const mine = new Set(load(KEYS.likes, []));
    const liked = !mine.has(postId);
    liked ? mine.add(postId) : mine.delete(postId);
    save(KEYS.likes, [...mine]);
    return { liked, count: liked ? 1 : 0 };
  },

  async commentCounts() {
    const all = load(KEYS.comments, {});
    return Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.length]));
  },
  async listComments(postId) {
    return (load(KEYS.comments, {})[postId] ?? []).map((c) => ({ ...c, own: true }));
  },
  async addComment(postId, { name, text }) {
    const comment = { id: uid(), name, text, createdAt: Date.now() };
    const all = load(KEYS.comments, {});
    all[postId] = [...(all[postId] ?? []), comment];
    if (!save(KEYS.comments, all)) throw new Error('Comments can’t be saved in this browser.');
    return { ...comment, own: true };
  },
  async deleteComment(postId, id) {
    const all = load(KEYS.comments, {});
    all[postId] = (all[postId] ?? []).filter((c) => c.id !== id);
    save(KEYS.comments, all);
  },

  async listPlaces() {
    return load(KEYS.posts, []);
  },
  async addPlace(place, photo) {
    const post = { ...place, id: `community-${uid()}`, date: new Date().toISOString(), likes: 0, userPost: true, own: true };
    if (photo) Object.assign(post, { image: photo.dataUrl, width: photo.width, height: photo.height });
    if (!save(KEYS.posts, [post, ...load(KEYS.posts, [])])) {
      throw new Error(photo ? 'The photo is too large to save in this browser. Try a smaller photo.' : 'Posts can’t be saved in this browser.');
    }
    return post;
  },
  async deletePlace(id) {
    save(KEYS.posts, load(KEYS.posts, []).filter((p) => p.id !== id));
  },

  async listTaste() {
    return load(KEYS.taste, []).map((e) => ({ mode: 'visual', ...e, own: true }));
  },
  async addTaste(entry) {
    const saved = { ...entry, id: uid(), createdAt: Date.now() };
    if (!save(KEYS.taste, [...load(KEYS.taste, []), saved])) throw new Error('Results can’t be saved in this browser.');
    return { ...saved, own: true };
  },
  async deleteTaste(id) {
    save(KEYS.taste, load(KEYS.taste, []).filter((e) => e.id !== id));
  },
};

/* ---------------- Supabase (shared) ---------------- */

// Accept the URL with or without a trailing /rest/v1 or slash.
const BASE = SUPABASE_URL.replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
// New-style keys (sb_publishable_…) are not JWTs: send them only as `apikey`.
// Legacy anon keys are JWTs and are also sent as a Bearer token.
const AUTH_HEADERS = SUPABASE_ANON_KEY.startsWith('sb_')
  ? { apikey: SUPABASE_ANON_KEY }
  : { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };

const FRIENDLY = {
  rate_limited: 'You’re going a little fast. Please wait a minute and try again.',
  invalid_input: 'Please check what you typed and try again.',
};

/** The server could not be reached (offline, DNS, timeout, 5xx). */
class NetworkError extends Error {
  constructor() {
    super('Couldn’t reach the server.');
    this.network = true;
  }
}

async function request(path, { method = 'GET', body, headers = {}, raw = false, timeout = 12000 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      signal: ctrl.signal,
      headers: { ...AUTH_HEADERS, ...(body && !raw ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: raw ? body : body && JSON.stringify(body),
    });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timer);
  }
  if (res.status >= 500) throw new NetworkError();
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    const key = Object.keys(FRIENDLY).find((k) => String(info.message ?? info.error ?? '').includes(k));
    const err = new Error(FRIENDLY[key] ?? 'Something went wrong. Please try again.');
    err.code = key;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const rpc = (fn, args = {}) => request(`/rest/v1/rpc/${fn}`, { method: 'POST', body: args });
const ownIds = (key) => new Set(load(key, []));
const remember = (key, id) => save(key, [...load(key, []), id].slice(-200));
const photoUrl = (path) => `${BASE}/storage/v1/object/public/places/${path}`;

const toPlace = (r) => ({
  id: r.id,
  title: r.title,
  location: r.location,
  feeling: r.feeling,
  description: r.description,
  author: r.author,
  colours: r.colours,
  mood: r.moods?.length ? r.moods : ['Joyful'],
  date: r.created_at,
  likes: 0,
  userPost: true,
  own: ownIds('my-places').has(r.id),
  ...(r.image_path ? { image: photoUrl(r.image_path), alt: `Photo of ${r.title} shared by ${r.author}`, width: r.width, height: r.height } : {}),
});

const toTaste = (r) => ({
  id: r.id,
  food: r.food,
  tester: r.tester,
  mode: r.mode,
  look: r.look,
  taste: r.taste,
  different: r.different,
  reaction: r.reaction,
  comment: r.comment ?? '',
  createdAt: Date.parse(r.created_at),
  own: false,
});

/** Direct calls to Supabase. Every method throws NetworkError when offline. */
const remote = {
  async loadLikes() {
    const [counts, mine] = await Promise.all([rpc('like_counts'), rpc('my_likes', { p_client_id: clientId })]);
    return { counts: Object.fromEntries(counts.map((r) => [r.post_id, Number(r.likes)])), mine: mine.map((r) => r.post_id ?? r) };
  },
  async toggleLike(postId) {
    const [r] = await rpc('toggle_like', { p_post_id: postId, p_client_id: clientId });
    return { liked: r.liked, count: Number(r.likes) };
  },
  async commentCounts() {
    const rows = await rpc('comment_counts');
    return Object.fromEntries(rows.map((r) => [r.post_id, Number(r.comments)]));
  },
  async listComments(postId) {
    const rows = await request(`/rest/v1/comments?select=id,name,body,created_at&post_id=eq.${encodeURIComponent(postId)}&order=created_at.asc&limit=200`);
    const own = ownIds('my-comments');
    return rows.map((r) => ({ id: r.id, name: r.name, text: r.body, createdAt: Date.parse(r.created_at), own: own.has(r.id), remote: true }));
  },
  async addComment(postId, { name, text }) {
    const [r] = await rpc('add_comment', { p_post_id: postId, p_name: name, p_body: text, p_client_id: clientId });
    remember('my-comments', r.id);
    return { id: r.id, name: r.name, text: r.body, createdAt: Date.parse(r.created_at), own: true, remote: true };
  },
  async listPlaces() {
    const rows = await request(
      '/rest/v1/places?select=id,title,location,feeling,description,author,colours,moods,image_path,width,height,created_at&order=created_at.desc&limit=60',
    );
    return rows.map(toPlace);
  },
  async addPlace(place, photo) {
    let imagePath = null;
    if (photo) {
      imagePath = `${crypto.randomUUID()}.jpg`;
      const blob = photo.blob ?? (await (await fetch(photo.dataUrl)).blob());
      await request(`/storage/v1/object/places/${imagePath}`, {
        method: 'POST',
        body: blob,
        raw: true,
        timeout: 30000,
        headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'false' },
      });
    }
    const [r] = await rpc('add_place', {
      p_title: place.title,
      p_location: place.location,
      p_feeling: place.feeling,
      p_description: place.description,
      p_author: place.author,
      p_colours: place.colours,
      p_moods: place.mood,
      p_image_path: imagePath,
      p_width: photo?.width ?? null,
      p_height: photo?.height ?? null,
      p_client_id: clientId,
    });
    remember('my-places', r.id);
    return { ...toPlace(r), own: true };
  },
  async listTaste() {
    const rows = await request('/rest/v1/taste_results?select=id,food,tester,mode,look,taste,different,reaction,comment,created_at&order=created_at.desc&limit=1000');
    return rows.map(toTaste);
  },
  async addTaste(entry) {
    const [r] = await rpc('add_taste', {
      p_food: entry.food,
      p_tester: entry.tester,
      p_mode: entry.mode,
      p_look: entry.look,
      p_taste: entry.taste,
      p_different: entry.different,
      p_reaction: entry.reaction,
      p_comment: entry.comment,
      p_client_id: clientId,
    });
    return toTaste(r);
  },
};

/* ---------------- Offline safety net ----------------
 * Reads: the last successful server response is cached on this device and
 * shown when the server can't be reached.
 * Writes: when offline, comments, places, results and likes are kept in an
 * outbox on this device, shown straight away (marked pending), and sent to
 * Supabase automatically when the connection returns.
 */

const cached = async (key, fn) => {
  try {
    const value = await fn();
    save(`cache:${key}`, value);
    return value;
  } catch (err) {
    if (!err.network) throw err;
    shared.offline = true;
    return load(`cache:${key}`, null);
  }
};

const outbox = {
  all: () => load('outbox', []),
  add(item) {
    if (!save('outbox', [...outbox.all(), item])) throw new Error('You’re offline and this can’t be stored on the device. Please try again later.');
  },
  remove(id) {
    save('outbox', outbox.all().filter((i) => i.id !== id));
  },
  of: (kind) => outbox.all().filter((i) => i.kind === kind),
};

const pendingId = () => `pending-${uid()}`;
const syncListeners = new Set();
let flushing = null;

async function flush() {
  if (flushing) return flushing;
  flushing = (async () => {
    let sent = 0;
    for (const item of outbox.all()) {
      try {
        if (item.kind === 'comment') await remote.addComment(item.postId, item.input);
        if (item.kind === 'place') await remote.addPlace(item.place, item.photo);
        if (item.kind === 'taste') await remote.addTaste(item.entry);
        if (item.kind === 'like') {
          // Toggle until the server matches what the visitor chose offline.
          let { liked } = await remote.toggleLike(item.postId);
          if (liked !== item.liked) ({ liked } = await remote.toggleLike(item.postId));
        }
        outbox.remove(item.id);
        sent++;
      } catch (err) {
        if (err.network || err.code === 'rate_limited') break; // try again later
        outbox.remove(item.id); // invalid: drop it so the queue can't jam
      }
    }
    if (sent) {
      shared.offline = false;
      syncListeners.forEach((fn) => fn(sent));
    }
  })().finally(() => (flushing = null));
  return flushing;
}

const shared = {
  mode: 'supabase',
  offline: false,
  onSync: (fn) => syncListeners.add(fn),
  flush,
  pendingCount: () => outbox.all().length,

  async loadLikes() {
    const base = (await cached('likes', () => remote.loadLikes())) ?? { counts: {}, mine: [] };
    const counts = { ...base.counts };
    let mine = [...base.mine];
    for (const { postId, liked } of outbox.of('like')) {
      const had = mine.includes(postId);
      if (liked && !had) {
        mine.push(postId);
        counts[postId] = (counts[postId] ?? 0) + 1;
      }
      if (!liked && had) {
        mine = mine.filter((id) => id !== postId);
        counts[postId] = Math.max(0, (counts[postId] ?? 1) - 1);
      }
    }
    return { counts, mine };
  },
  async toggleLike(postId, { wasLiked = false, count = 0 } = {}) {
    try {
      return await remote.toggleLike(postId);
    } catch (err) {
      if (!err.network) throw err;
      shared.offline = true;
      const liked = !wasLiked;
      const queued = outbox.of('like').find((i) => i.postId === postId);
      if (queued) outbox.remove(queued.id);
      if (!queued) outbox.add({ id: pendingId(), kind: 'like', postId, liked });
      return { liked, count: Math.max(0, count + (liked ? 1 : -1)), pending: true };
    }
  },

  async commentCounts() {
    const counts = { ...((await cached('comment-counts', () => remote.commentCounts())) ?? {}) };
    for (const { postId } of outbox.of('comment')) counts[postId] = (counts[postId] ?? 0) + 1;
    return counts;
  },
  async listComments(postId) {
    const list = (await cached(`comments:${postId}`, () => remote.listComments(postId))) ?? [];
    const pending = outbox
      .of('comment')
      .filter((i) => i.postId === postId)
      .map((i) => ({ id: i.id, ...i.input, createdAt: i.createdAt, own: true, pending: true }));
    return [...list, ...pending];
  },
  async addComment(postId, input) {
    try {
      return await remote.addComment(postId, input);
    } catch (err) {
      if (!err.network) throw err;
      shared.offline = true;
      const item = { id: pendingId(), kind: 'comment', postId, input, createdAt: Date.now() };
      outbox.add(item);
      return { id: item.id, ...input, createdAt: item.createdAt, own: true, pending: true };
    }
  },
  async deleteComment(postId, id) {
    if (!String(id).startsWith('pending-')) throw new Error('Shared comments can’t be deleted from the site.');
    outbox.remove(id);
  },

  async listPlaces() {
    const list = (await cached('places', () => remote.listPlaces())) ?? [];
    const pending = outbox.of('place').map((i) => ({
      ...i.place,
      id: i.id,
      date: new Date(i.createdAt).toISOString(),
      likes: 0,
      userPost: true,
      own: true,
      pending: true,
      ...(i.photo ? { image: i.photo.dataUrl, width: i.photo.width, height: i.photo.height } : {}),
    }));
    return [...pending, ...list];
  },
  async addPlace(place, photo) {
    try {
      return await remote.addPlace(place, photo);
    } catch (err) {
      if (!err.network) throw err;
      shared.offline = true;
      const keep = photo ? { dataUrl: photo.dataUrl, width: photo.width, height: photo.height } : null;
      const item = { id: pendingId(), kind: 'place', place, photo: keep, createdAt: Date.now() };
      outbox.add(item);
      return (await shared.listPlaces()).find((p) => p.id === item.id);
    }
  },
  async deletePlace(id) {
    if (!String(id).startsWith('pending-')) throw new Error('Shared posts can’t be deleted from the site.');
    outbox.remove(id);
  },

  async listTaste() {
    const list = (await cached('taste', () => remote.listTaste())) ?? [];
    const pending = outbox.of('taste').map((i) => ({ ...i.entry, id: i.id, createdAt: i.createdAt, own: true, pending: true }));
    return [...list, ...pending];
  },
  async addTaste(entry) {
    try {
      return await remote.addTaste(entry);
    } catch (err) {
      if (!err.network) throw err;
      shared.offline = true;
      const item = { id: pendingId(), kind: 'taste', entry, createdAt: Date.now() };
      outbox.add(item);
      return { ...entry, id: item.id, createdAt: item.createdAt, own: true, pending: true };
    }
  },
  async deleteTaste(id) {
    if (!String(id).startsWith('pending-')) throw new Error('Shared results can’t be deleted from the site.');
    outbox.remove(id);
  },
};

export const backend = BASE && SUPABASE_ANON_KEY ? shared : local;

if (backend === shared) {
  addEventListener('online', () => flush());
  // Send anything left over from a previous offline visit.
  if (outbox.all().length) setTimeout(flush, 1500);
}
