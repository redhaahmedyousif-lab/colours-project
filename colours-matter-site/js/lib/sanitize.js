/**
 * Input hygiene shared by every form. The server (supabase/schema.sql)
 * repeats these checks, so they also hold against direct API calls.
 */
import { load, save } from './storage.js?v=muu366i1';

const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;

/** Strip tags, control and bidi-override characters, collapse whitespace, cap length. */
export function cleanText(value, max) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(CONTROL, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

export const isHex = (s) => /^#[0-9a-f]{6}$/i.test(s);

/**
 * Client-side rate limit (the server enforces its own). Returns the number
 * of seconds to wait, or 0 when the action is allowed and recorded.
 */
export function rateLimit(key, { max, windowMs, minGapMs = 0 }) {
  const now = Date.now();
  const hits = load(`rl:${key}`, []).filter((t) => now - t < windowMs);
  const last = hits[hits.length - 1] ?? 0;
  if (hits.length >= max) return Math.ceil((windowMs - (now - hits[0])) / 1000);
  if (now - last < minGapMs) return Math.ceil((minGapMs - (now - last)) / 1000);
  save(`rl:${key}`, [...hits, now]);
  return 0;
}

export const IMAGE_RULES = {
  types: ['image/jpeg', 'image/png', 'image/webp'],
  maxBytes: 8 * 1024 * 1024,
  maxPixels: 40_000_000,
  minSide: 64,
};

/** Check the real file signature, not just the name or reported type. */
async function sniff(file) {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  const ascii = String.fromCharCode(...b);
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

/**
 * Validate an uploaded photo and return a decoded ImageBitmap.
 * Throws an Error with a visitor-friendly message.
 */
export async function validateImage(file) {
  if (!file) throw new Error('No file was chosen.');
  if (!IMAGE_RULES.types.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP photo.');
  if (file.size > IMAGE_RULES.maxBytes) throw new Error('That photo is larger than 8 MB. Please choose a smaller one.');
  const real = await sniff(file);
  if (!real || real !== file.type) throw new Error('That file is not a valid photo.');
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('That photo could not be opened.');
  }
  const { width, height } = bitmap;
  if (width * height > IMAGE_RULES.maxPixels) throw new Error('That photo is too large to process.');
  if (Math.min(width, height) < IMAGE_RULES.minSide) throw new Error('That photo is too small.');
  return bitmap;
}

/**
 * Re-encode to a fresh JPEG. Drawing to a canvas drops EXIF data (including
 * GPS location) and anything hidden in the original file.
 */
export function reencode(bitmap, maxSide = 1280, quality = 0.82) {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = Object.assign(document.createElement('canvas'), {
    width: Math.round(bitmap.width * scale),
    height: Math.round(bitmap.height * scale),
  });
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process the photo.'))), 'image/jpeg', quality),
  );
}

export const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
