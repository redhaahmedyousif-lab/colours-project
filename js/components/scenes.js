/**
 * Illustrated "postcards" for the colour blog. They stand in for photos so
 * the site works with no image files; add a real `image` to a post in
 * src/data/blog.js to show a photograph instead.
 */
const wrap = (inner, sky) => `
  <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" class="h-full w-full" aria-hidden="true">
    <defs>
      <linearGradient id="sky-${sky.id}" x1="0" y1="0" x2="0" y2="1">
        ${sky.stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#sky-${sky.id})"/>
    ${inner}
  </svg>`;

const scenes = {
  souq: () =>
    wrap(
      `
      <rect y="0" width="400" height="260" fill="#3b1d0e" opacity=".55"/>
      ${[0, 1, 2, 3].map((i) => {
        const x = 10 + i * 100;
        return `
        <path d="M${x} 260 V110 a40 40 0 0 1 80 0 V260 z" fill="#fde68a" opacity=".16"/>
        <path d="M${x + 6} 120 h68 l-6 16 h-56 z" fill="${['#b91c1c', '#ea580c', '#0f766e', '#7e22ce'][i]}"/>
        <line x1="${x + 40}" y1="0" x2="${x + 40}" y2="58" stroke="#fde68a" stroke-width="1.2" opacity=".7"/>
        <path d="M${x + 30} 58 h20 l5 18 h-30 z" fill="${['#f59e0b', '#ef4444', '#facc15', '#06b6d4'][i]}"/>
        <circle cx="${x + 40}" cy="70" r="16" fill="#fde68a" opacity=".25"/>`;
      }).join('')}
      <rect y="196" width="400" height="64" fill="#451a03"/>
      ${Array.from({ length: 10 }, (_, i) => {
        const colours = ['#ea580c', '#facc15', '#b91c1c', '#65a30d', '#9a3412', '#f59e0b', '#be123c', '#ca8a04', '#c2410c', '#15803d'];
        return `<ellipse cx="${22 + i * 40}" cy="${200 + (i % 2) * 4}" rx="17" ry="12" fill="${colours[i]}"/>
                <ellipse cx="${22 + i * 40}" cy="${196 + (i % 2) * 4}" rx="13" ry="5" fill="#fff" opacity=".18"/>`;
      }).join('')}
      <rect y="214" width="400" height="46" fill="#292524" opacity=".7"/>`,
      { id: 'souq', stops: [[0, '#7c2d12'], [1, '#f59e0b']] },
    ),

  gate: () =>
    wrap(
      `
      <circle cx="320" cy="60" r="26" fill="#fef3c7" opacity=".9"/>
      <rect x="40" y="110" width="320" height="150" fill="#f5ead6"/>
      <rect x="40" y="96" width="320" height="18" fill="#e7d6b8"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${44 + i * 20}" y="84" width="10" height="14" fill="#e7d6b8"/>`).join('')}
      <path d="M150 260 V170 a50 50 0 0 1 100 0 V260 z" fill="#7c5a3a"/>
      <path d="M160 260 V172 a40 40 0 0 1 80 0 V260 z" fill="#2c1a0e" opacity=".55"/>
      ${[70, 290].map((x) => `<path d="M${x} 210 V170 a20 20 0 0 1 40 0 V210 z" fill="#c9a87a"/>`).join('')}
      ${[70, 290].map((x) => `<rect x="${x + 4}" y="128" width="32" height="24" rx="4" fill="#0e7490" opacity=".7"/>`).join('')}
      <rect x="185" y="118" width="30" height="20" fill="#ce1126"/>
      <path d="M185 118 h9 l-3 2.5 3 2.5 -3 2.5 3 2.5 -3 2.5 3 2.5 -3 2.5 3 2.5 h-9z" fill="#fff"/>
      <rect y="250" width="400" height="10" fill="#a8a29e"/>`,
      { id: 'gate', stops: [[0, '#38bdf8'], [1, '#bae6fd']] },
    ),

  houses: () =>
    wrap(
      `
      ${[
        [0, 90, '#e8d5b0'],
        [95, 70, '#f1e4c8'],
        [190, 100, '#dcc49a'],
        [300, 100, '#eadbbd'],
      ]
        .map(
          ([x, y, c], i) => `
        <rect x="${x}" y="${y}" width="${i === 2 ? 110 : 100}" height="${260 - y}" fill="${c}"/>
        <rect x="${x}" y="${y}" width="${i === 2 ? 110 : 100}" height="8" fill="#000" opacity=".06"/>
        ${[0, 1, 2].map((k) => `<rect x="${x + 14 + k * 26}" y="${y + 22}" width="14" height="30" rx="7" fill="#57534e" opacity=".22"/>`).join('')}
        <path d="M${x + 30} 260 V${y + 100} a20 20 0 0 1 40 0 V260 z" fill="${['#0f766e', '#1d4ed8', '#b45309', '#0e7490'][i]}"/>
        <circle cx="${x + 62}" cy="${y + 140}" r="2.5" fill="#fbbf24"/>`,
        )
        .join('')}
      <path d="M270 70 q30 -40 60 0" stroke="#15803d" stroke-width="6" fill="none"/>
      <path d="M300 30 q-25 5 -40 30 M300 30 q25 5 40 30 M300 30 q-5 -20 -25 -25 M300 30 q5 -20 25 -25" stroke="#16a34a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="297" y="30" width="6" height="70" fill="#78350f"/>`,
      { id: 'houses', stops: [[0, '#7dd3fc'], [1, '#e0f2fe']] },
    ),

  fort: () =>
    wrap(
      `
      <circle cx="300" cy="150" r="46" fill="#fde047" opacity=".9"/>
      <circle cx="300" cy="150" r="80" fill="#fde047" opacity=".15"/>
      <path d="M0 180 L60 180 L60 140 L80 140 L80 130 L100 130 L100 140 L180 140 L180 120 L210 120 L210 140 L290 140 L290 130 L310 130 L310 140 L340 140 L340 180 L400 180 L400 260 L0 260 Z" fill="#3b1d2e"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${60 + i * 20}" y="${i % 4 === 0 ? 112 : 132}" width="8" height="10" fill="#3b1d2e"/>`).join('')}
      <path d="M0 210 Q100 200 200 214 T400 206 V260 H0Z" fill="#7c2d12"/>
      <path d="M0 230 Q120 220 220 234 T400 228 V260 H0Z" fill="#431407"/>`,
      { id: 'fort', stops: [[0, '#4c1d95'], [0.45, '#db2777'], [0.8, '#f97316'], [1, '#fbbf24']] },
    ),

  tree: () =>
    wrap(
      `
      <circle cx="80" cy="60" r="22" fill="#fff7ed" opacity=".9"/>
      <path d="M0 190 Q100 170 200 186 T400 178 V260 H0Z" fill="#e7b46a"/>
      <path d="M0 214 Q120 196 240 214 T400 206 V260 H0Z" fill="#d4973f"/>
      <path d="M196 196 C194 170 198 150 192 130 M204 196 C206 170 202 150 210 128" stroke="#57381f" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M196 140 L160 118 M206 136 L246 112 M200 150 L178 156" stroke="#57381f" stroke-width="5" stroke-linecap="round"/>
      ${[
        [200, 98, 58],
        [150, 112, 38],
        [252, 108, 40],
        [176, 82, 34],
        [228, 80, 34],
      ]
        .map(([cx, cy, r], i) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${['#15803d', '#16a34a', '#166534', '#22c55e', '#15803d'][i]}" opacity=".95"/>`)
        .join('')}
      <ellipse cx="200" cy="200" rx="60" ry="6" fill="#92400e" opacity=".35"/>`,
      { id: 'tree', stops: [[0, '#fb923c'], [0.55, '#fcd34d'], [1, '#fef3c7']] },
    ),

  mosque: () =>
    wrap(
      `
      <rect x="0" y="200" width="400" height="60" fill="#e7e5e4"/>
      <rect x="90" y="140" width="220" height="70" fill="#f5f5f4"/>
      <path d="M140 140 a60 58 0 0 1 120 0 z" fill="#d6c7a1"/>
      <rect x="196" y="72" width="8" height="12" fill="#a16207"/>
      <circle cx="200" cy="70" r="5" fill="#ca8a04"/>
      ${[50, 334].map((x) => `
        <rect x="${x}" y="70" width="16" height="140" fill="#fafaf9"/>
        <rect x="${x - 3}" y="100" width="22" height="6" fill="#d6d3d1"/>
        <path d="M${x} 70 l8 -24 l8 24 z" fill="#d6c7a1"/>`).join('')}
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M${110 + i * 40} 210 V178 a12 12 0 0 1 24 0 V210 z" fill="#0e7490" opacity=".55"/>`).join('')}
      <rect y="210" width="400" height="6" fill="#d6d3d1"/>`,
      { id: 'mosque', stops: [[0, '#0369a1'], [1, '#7dd3fc']] },
    ),

  sea: () =>
    wrap(
      `
      <circle cx="330" cy="54" r="20" fill="#fffbeb"/>
      <rect y="120" width="400" height="140" fill="#0891b2"/>
      <path d="M0 150 Q100 140 200 150 T400 146 V260 H0Z" fill="#06b6d4"/>
      <path d="M0 180 Q100 168 200 182 T400 176 V260 H0Z" fill="#22d3ee"/>
      <ellipse cx="200" cy="196" rx="150" ry="18" fill="#fef3c7"/>
      <ellipse cx="200" cy="192" rx="120" ry="10" fill="#fffbeb"/>
      <path d="M0 225 Q100 214 200 226 T400 220 V260 H0Z" fill="#67e8f9" opacity=".7"/>
      ${[60, 110, 280, 330].map((x, i) => `<path d="M${x} ${132 + (i % 2) * 8} q6 -4 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>`).join('')}
      <path d="M90 150 l20 0 l-4 6 h-12 z M100 150 V132 l10 14 z" fill="#78350f"/>
      <path d="M100 132 l12 14 h-12z" fill="#fff"/>`,
      { id: 'sea', stops: [[0, '#38bdf8'], [1, '#e0f2fe']] },
    ),
};

/** Abstract art made from a visitor's chosen colours (used when no photo). */
export function abstractScene(colours) {
  const [a, b, c] = colours;
  return `
  <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" class="h-full w-full" aria-hidden="true">
    <rect width="400" height="260" fill="${a}"/>
    <circle cx="90" cy="70" r="140" fill="${b}" opacity=".85"/>
    <circle cx="330" cy="220" r="150" fill="${c}" opacity=".8"/>
    <circle cx="260" cy="60" r="60" fill="#fff" opacity=".18"/>
  </svg>`;
}

export function sceneSvg(key) {
  return (scenes[key] ?? scenes.souq)();
}
