/**
 * Colour helpers: hex/RGB/HSL conversion, naming a colour's family,
 * extracting a palette from a photo (k-means), and reading its mood.
 */

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const rgbToHex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

export const families = {
  red: { label: 'red', sample: '#ce1126' },
  orange: { label: 'orange', sample: '#ea580c' },
  brown: { label: 'earthy brown', sample: '#9a5b34' },
  yellow: { label: 'gold', sample: '#d4a017' },
  green: { label: 'green', sample: '#0f766e' },
  turquoise: { label: 'turquoise', sample: '#0e9fb3' },
  blue: { label: 'blue', sample: '#2563eb' },
  purple: { label: 'purple', sample: '#7c3aed' },
  pink: { label: 'pink', sample: '#ec4899' },
  sand: { label: 'sandy beige', sample: '#e9d8b8' },
  white: { label: 'white', sample: '#f4efe6' },
  black: { label: 'night black', sample: '#0b1026' },
  grey: { label: 'grey', sample: '#78716c' },
};

/** Name the family a colour belongs to (what a person would call it). */
export function family(hex) {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  if (l > 0.88 && s < 0.5) return 'white';
  if (l < 0.13) return 'black';
  if (s < 0.14) return l > 0.75 ? 'white' : 'grey';
  if (l > 0.72 && h >= 18 && h < 62 && s < 0.7) return 'sand';
  if (h < 14 || h >= 345) return l < 0.3 ? 'brown' : 'red';
  if (h < 42) return l < 0.42 || (s < 0.45 && l < 0.6) ? 'brown' : 'orange';
  if (h < 66) return l < 0.32 ? 'brown' : 'yellow';
  if (h < 180) return 'green';
  if (h < 200) return 'turquoise';
  if (h < 255) return 'blue';
  if (h < 295) return 'purple';
  return 'pink';
}

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/**
 * Extract the `k` most representative colours from an image (ImageBitmap,
 * HTMLImageElement or canvas). Returns [{ hex, share }] sorted by share.
 */
export function extractPalette(source, k = 5) {
  const size = 96;
  const scale = Math.min(1, size / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * scale));
  const h = Math.max(1, Math.round(source.height * scale));
  const ctx = Object.assign(document.createElement('canvas'), { width: w, height: h }).getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 127) pixels.push([data[i], data[i + 1], data[i + 2]]);
  if (!pixels.length) return [];

  // k-means++ seeding (deterministic: start from the middle pixel).
  const centres = [pixels[Math.floor(pixels.length / 2)]];
  while (centres.length < k) {
    let best = null;
    let bestD = -1;
    for (let i = 0; i < pixels.length; i += 7) {
      const d = Math.min(...centres.map((c) => dist2(c, pixels[i])));
      if (d > bestD) {
        bestD = d;
        best = pixels[i];
      }
    }
    centres.push(best);
  }

  const assign = new Uint8Array(pixels.length);
  for (let iter = 0; iter < 10; iter++) {
    const sums = centres.map(() => [0, 0, 0, 0]);
    pixels.forEach((p, i) => {
      let bi = 0;
      let bd = Infinity;
      centres.forEach((c, ci) => {
        const d = dist2(c, p);
        if (d < bd) {
          bd = d;
          bi = ci;
        }
      });
      assign[i] = bi;
      const s = sums[bi];
      s[0] += p[0];
      s[1] += p[1];
      s[2] += p[2];
      s[3]++;
    });
    sums.forEach((s, i) => {
      if (s[3]) centres[i] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    });
  }

  const counts = centres.map((_, i) => assign.reduce((n, a) => n + (a === i), 0));
  const result = centres
    .map((c, i) => ({ rgb: c, share: counts[i] / pixels.length }))
    .filter((c) => c.share > 0.01)
    .sort((a, b) => b.share - a.share);

  // Merge near-duplicates so the palette shows distinct colours.
  const distinct = [];
  for (const c of result) {
    const twin = distinct.find((d) => dist2(d.rgb, c.rgb) < 18 ** 2);
    if (twin) twin.share += c.share;
    else distinct.push(c);
  }
  return distinct.map((c) => ({ hex: rgbToHex(...c.rgb), share: c.share }));
}

/** Read the emotional character of a palette. Returns { moods, summary }. */
export function readMood(palette) {
  let warm = 0;
  let sat = 0;
  let light = 0;
  let total = 0;
  let dark = 0;
  for (const { hex, share = 1 / palette.length } of palette) {
    const [h, s, l] = rgbToHsl(...hexToRgb(hex));
    const chroma = s * (1 - Math.abs(2 * l - 1));
    const warmth = h < 75 || h > 330 ? 1 : h > 165 && h < 280 ? -1 : 0;
    warm += warmth * chroma * share;
    sat += chroma * share;
    light += l * share;
    if (l < 0.18) dark += share;
    total += share;
  }
  warm /= total;
  sat /= total;
  light /= total;

  if (light < 0.28 || dark / total > 0.4) return { moods: ['Awe', 'Calm'], summary: 'Deep and dark: it feels still, dramatic and a little mysterious.' };
  if (sat < 0.12) return { moods: ['Calm', 'Peaceful'], summary: 'Soft and muted: it feels quiet, gentle and timeless.' };
  if (warm > 0.08) {
    return sat > 0.3
      ? { moods: ['Energetic', 'Joyful'], summary: 'Warm and vivid: it feels lively, busy and welcoming.' }
      : { moods: ['Nostalgic', 'Calm'], summary: 'Warm and earthy: it feels grounded, familiar and safe.' };
  }
  if (warm < -0.08) {
    return light > 0.55
      ? { moods: ['Free', 'Peaceful'], summary: 'Cool and bright: it feels open, fresh and free.' }
      : { moods: ['Calm', 'Curious'], summary: 'Cool and deep: it feels calm, thoughtful and reflective.' };
  }
  return { moods: ['Hopeful', 'Curious'], summary: 'Balanced between warm and cool: it feels harmonious and inviting.' };
}
