/**
 * Inline SVG illustration of a traditional A'ali clay jar. Colours are
 * parameters so the jar can be "re-glazed" interactively.
 */
let count = 0;

export const JAR_SHAPE =
  'M72 34 C72 50 84 54 82 66 C50 80 34 120 38 160 C42 205 70 240 100 242 C130 240 158 205 162 160 C166 120 150 80 118 66 C116 54 128 50 128 34 Z';

export function jarSvg({ body = '#9a5b34', band = '#0f766e', shade = '#6b3b1f', className = '', label } = {}) {
  const id = `jar-${++count}`;
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  const shape = JAR_SHAPE;
  return `
  <svg viewBox="0 0 200 270" class="${className}" ${a11y}>
    <defs>
      <clipPath id="${id}-clip"><path d="${shape}"/></clipPath>
      <radialGradient id="${id}-light" cx="35%" cy="40%" r="70%">
        <stop offset="0" stop-color="#fff" stop-opacity=".28"/>
        <stop offset=".55" stop-color="#fff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity=".35"/>
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="252" rx="58" ry="8" fill="#000" opacity=".18"/>
    <g clip-path="url(#${id}-clip)">
      <rect width="200" height="270" fill="${body}" data-part="body" style="transition:fill .6s"/>
      <g fill="${band}" data-part="band" style="transition:fill .6s">
        <rect x="0" y="96" width="200" height="12"/>
        <rect x="0" y="114" width="200" height="4"/>
        <path d="M0 176 q12.5 -12 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 v8 q-12.5 -12 -25 0 t-25 0 t-25 0 t-25 0 t-25 0 t-25 0 t-25 0 t-25 0 z"/>
        <rect x="0" y="198" width="200" height="4"/>
      </g>
      <g fill="${shade}" data-part="shade" opacity=".55" style="transition:fill .6s">
        <circle cx="70" cy="145" r="3"/><circle cx="85" cy="145" r="3"/><circle cx="100" cy="145" r="3"/>
        <circle cx="115" cy="145" r="3"/><circle cx="130" cy="145" r="3"/><circle cx="55" cy="145" r="3"/><circle cx="145" cy="145" r="3"/>
      </g>
      <rect width="200" height="270" fill="url(#${id}-light)"/>
    </g>
    <ellipse cx="100" cy="34" rx="28" ry="6" fill="${shade}" data-part="rim" style="transition:fill .6s"/>
    <ellipse cx="100" cy="34" rx="20" ry="3.5" fill="#000" opacity=".45"/>
  </svg>`;
}

/** Recolour a rendered jar in place (animated via CSS transitions). */
export function glazeJar(svg, { body, band, shade }) {
  if (body) svg.querySelector('[data-part="body"]').setAttribute('fill', body);
  if (band) svg.querySelector('[data-part="band"]').setAttribute('fill', band);
  if (shade) {
    svg.querySelector('[data-part="shade"]').setAttribute('fill', shade);
    svg.querySelector('[data-part="rim"]').setAttribute('fill', shade);
  }
}
