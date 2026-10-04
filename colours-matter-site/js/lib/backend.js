/**
 * Data layer. One interface, two implementations:
 *   - Supabase (shared by all visitors) when src/data/config.js has keys
 *   - localStorage (this browser only) otherwise
 *
 * Supabase is reached with plain fetch() calls to its REST API, so no client
 * library is loaded. All writes go through Postgres functions that validate
 * input and apply rate limits (see supabase/schema.sql).
 */
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../data/config.js?v=muu1oee4';
import { load, save, uid } from './storage.js?v=muu1oee4';

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

const FRIENDLY = {
  rate_limited: 'You’re going a little fast. Please wait a minute and try again.',
  invalid_input: 'Please check what you typed and try again.',
};

async function request(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  let res;
  try {
    res = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        ...(body && !raw ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: raw ? body : body && JSON.stringify(body),
    });
  } catch {
    throw new Error('Couldn’t reach the server. Check your connection and try again.');
  }
  if (!res.ok) {
    const info = await res.json().catch(() => ({}));
    const key = Object.keys(FRIENDLY).find((k) => String(info.message ?? info.error ?? '').includes(k));
    throw new Error(FRIENDLY[key] ?? 'Something went wrong. Please try again.');
  }
  return res.status === 204 ? null : res.json();
}

const rpc = (fn, args = {}) => request(`/rest/v1/rpc/${fn}`, { method: 'POST', body: args });
const ownIds = (key) => new Set(load(key, []));
const remember = (key, id) => save(key, [...load(key, []), id].slice(-200));
const photoUrl = (path) => `${SUPABASE_URL}/storage/v1/object/public/places/${path}`;

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

const remote = {
  mode: 'supabase',

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
    const rows = await request(
      `/rest/v1/comments?select=id,name,body,created_at&post_id=eq.${encodeURIComponent(postId)}&order=created_at.asc&limit=200`,
    );
    const own = ownIds('my-comments');
    return rows.map((r) => ({ id: r.id, name: r.name, text: r.body, createdAt: Date.parse(r.created_at), own: own.has(r.id), remote: true }));
  },
  async addComment(postId, { name, text }) {
    const [r] = await rpc('add_comment', { p_post_id: postId, p_name: name, p_body: text, p_client_id: clientId });
    remember('my-comments', r.id);
    return { id: r.id, name: r.name, text: r.body, createdAt: Date.parse(r.created_at), own: true, remote: true };
  },
  async deleteComment() {
    throw new Error('Shared comments can’t be deleted from the site.');
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
      await request(`/storage/v1/object/places/${imagePath}`, {
        method: 'POST',
        body: photo.blob,
        raw: true,
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
    return toPlace(r);
  },
  async deletePlace() {
    throw new Error('Shared posts can’t be deleted from the site.');
  },

  async listTaste() {
    const rows = await request(
      '/rest/v1/taste_results?select=id,food,tester,mode,look,taste,different,reaction,comment,created_at&order=created_at.desc&limit=1000',
    );
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
  async deleteTaste() {
    throw new Error('Shared results can’t be deleted from the site.');
  },
};

export const backend = SUPABASE_URL && SUPABASE_ANON_KEY ? remote : local;
