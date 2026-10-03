/**
 * Tiny persistence layer. The site is static, so visitor data (comments,
 * likes, logged results, shared places) is saved in the browser with
 * localStorage. Every read and write is guarded so the app still works in
 * private windows or when storage is blocked.
 *
 * To make comments shared between all visitors, swap these two functions for
 * calls to a hosted backend (e.g. Firebase or Supabase) — nothing else needs
 * to change.
 */
const PREFIX = 'cm:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const uid = () =>
  (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
