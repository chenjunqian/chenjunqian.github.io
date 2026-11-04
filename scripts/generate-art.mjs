// Generates the cover artwork, favicon and project mark as deterministic SVG.
// Run with: node scripts/generate-art.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const out = join(process.cwd(), 'public', 'images', 'covers');
const root = join(process.cwd(), 'public');

const W = 1600;
const H = 900;

const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
  </filter>`;

function softGradient(id, stops) {
  return `
    <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      ${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}
    </radialGradient>`;
}

function glowCircle(id, cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}

/* ------------------------------------------------------------------ */
/* Cover — two lanes of tool calls, one serialized, one collapsed      */
/* ------------------------------------------------------------------ */
function coverDsh() {
  const yTop = 392;
  const yBot = 620;

  const chip = (x, y, w, h, o) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="rgba(0, 0, 0, ${o})"/>`;

  let serialized = '';
  for (let i = 0; i < 5; i += 1) {
    const x = 300 + i * 228;
    serialized += `<rect x="${x}" y="${yTop - 30}" width="128" height="60" rx="16" fill="#ffffff" stroke="rgba(0, 0, 0, 0.28)" stroke-width="1.6"/>`;
    serialized += `<circle cx="${x + 30}" cy="${yTop}" r="7" fill="#111111"/>`;
    serialized += chip(x + 46, yTop - 5, 62, 10, 0.2);
    if (i < 4) {
      serialized += `<path d="M${x + 128} ${yTop} h${100}" stroke="rgba(0, 0, 0, 0.42)" stroke-width="1.6" stroke-dasharray="3 8" stroke-linecap="round"/>`;
    }
  }

  let collapsed = `<rect x="300" y="${yBot - 42}" width="1040" height="84" rx="24" fill="rgba(0, 0, 0, 0.05)" stroke="rgba(0, 0, 0, 0.26)" stroke-width="1.6"/>`;
  for (let i = 0; i < 5; i += 1) {
    const x = 360 + i * 216;
    collapsed += `<circle cx="${x}" cy="${yBot}" r="7" fill="#111111"/>`;
    collapsed += chip(x + 20, yBot - 5, 74, 10, 0.2);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.55" stop-color="#f7f7f7"/>
      <stop offset="1" stop-color="#eeeeee"/>
    </linearGradient>
    ${softGradient('halo', [
      ['0', '#ffffff', '1'],
      ['0.55', '#f2f2f2', '0.55'],
      ['1', '#eeeeee', '0'],
    ])}
    <radialGradient id="vignette" cx="50%" cy="46%" r="74%">
      <stop offset="0.6" stop-color="#000000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.1"/>
    </radialGradient>
    ${grain}
  </defs>

  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  ${glowCircle('halo', 900, 120, 760)}

  <g>
    <path d="M300 ${yTop - 96} H1140" stroke="rgba(0, 0, 0, 0.14)" stroke-width="1"/>
    <path d="M300 ${yBot + 96} H1340" stroke="rgba(0, 0, 0, 0.14)" stroke-width="1"/>
  </g>

  <g>${serialized}</g>
  <g>${collapsed}</g>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.05"/>
</svg>`;
}


/* ------------------------------------------------------------------ */
/* Favicon                                                             */
/* ------------------------------------------------------------------ */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2f2f2f"/>
      <stop offset="0.55" stop-color="#1a1a1a"/>
      <stop offset="1" stop-color="#090909"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#g)"/>
  <text x="32" y="44" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#ffffff">J</text>
</svg>`;

/* ------------------------------------------------------------------ */
/* JD Matcher mark                                                     */
/* ------------------------------------------------------------------ */
const jdMatcher = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#f2f2f2"/>
  <rect x="116" y="96" width="216" height="286" rx="30" fill="none" stroke="#292929" stroke-width="20"/>
  <path d="M168 178h112M168 238h112M168 298h56" stroke="#292929" stroke-width="18" stroke-linecap="round" opacity="0.55"/>
  <circle cx="340" cy="344" r="92" fill="#f1f1f1" stroke="#292929" stroke-width="18"/>
  <path d="M298 344l30 30 56-66" fill="none" stroke="#292929" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

await mkdir(out, { recursive: true });
await mkdir(join(root, 'images', 'projects'), { recursive: true });

await writeFile(join(out, 'dsh-vs-pi.svg'), coverDsh());
await writeFile(join(root, 'favicon.svg'), favicon);
await writeFile(join(root, 'images', 'projects', 'jd-matcher.svg'), jdMatcher);

console.log('artwork written');
