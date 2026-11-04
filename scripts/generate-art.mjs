// Generates the cover artwork, favicon and project mark as deterministic SVG.
// Run with: node scripts/generate-art.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const out = join(process.cwd(), 'public', 'images', 'covers');
const root = join(process.cwd(), 'public');

const W = 1600;
const H = 900;

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" type="saturate" values="0"/>
  </filter>`;

function stars(seed, count, maxY, color = '#ffe6c2') {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < count; i += 1) {
    const x = r() * W;
    const y = r() * maxY;
    const radius = r() * 1.5 + 0.35;
    const o = (r() * 0.55 + 0.15).toFixed(2);
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(2)}" fill="${color}" opacity="${o}"/>`;
  }
  return s;
}

function ridge(seed, baseY, amp, steps, fill, rim) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const x = (i / steps) * W;
    const noise = r();
    const phase = (i / steps) * Math.PI * 3.2;
    const y =
      baseY -
      Math.sin(phase) * amp * 0.45 -
      Math.sin(phase * 1.9 + noise * 2) * amp * (0.18 + noise * 0.28) -
      noise * amp * 0.12;
    pts.push([x, y]);
  }
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const area = `${line} L${W} ${H + 10} L0 ${H + 10} Z`;
  return `
    <path d="${area}" fill="${fill}"/>
    <path d="${line}" fill="none" stroke="${rim}" stroke-width="1.6" stroke-linejoin="round"/>
  `;
}

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
/* Cover 1 — amber dawn over mountains                                 */
/* ------------------------------------------------------------------ */
function coverHello() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#080506"/>
      <stop offset="0.38" stop-color="#170d0b"/>
      <stop offset="0.62" stop-color="#3a1c0e"/>
      <stop offset="0.82" stop-color="#1d0f09"/>
      <stop offset="1" stop-color="#090605"/>
    </linearGradient>
    ${softGradient('sun', [
      ['0', '#ffe4b8', '0.95'],
      ['0.18', '#ffc27f', '0.62'],
      ['0.45', '#e8894a', '0.26'],
      ['1', '#e8894a', '0'],
    ])}
    ${softGradient('sunCore', [
      ['0', '#fff6e4', '1'],
      ['0.65', '#ffd39a', '0.95'],
      ['1', '#ffb267', '0'],
    ])}
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.62"/>
    </radialGradient>
    <radialGradient id="mist" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#ffd9a8" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/>
    </radialGradient>
    <filter id="soften"><feGaussianBlur stdDeviation="34"/></filter>
    ${grain}
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${stars(7, 90, 470)}
  ${glowCircle('sun', 980, 596, 520)}
  ${glowCircle('sunCore', 980, 596, 150)}

  ${ridge(11, 668, 150, 30, '#251409', 'rgba(255,190,130,0.16)')}
  <ellipse cx="700" cy="626" rx="900" ry="86" fill="url(#mist)" filter="url(#soften)"/>
  ${ridge(23, 730, 130, 34, '#180e08', 'rgba(255,190,130,0.2)')}
  <ellipse cx="1100" cy="712" rx="820" ry="70" fill="url(#mist)" opacity="0.8" filter="url(#soften)"/>
  ${ridge(37, 798, 108, 38, '#0d0705', 'rgba(255,205,150,0.26)')}

  <!-- paper-like horizontal strata in the foreground -->
  <rect y="812" width="${W}" height="88" fill="#080504"/>
  <path d="M0 824 H${W}" stroke="rgba(255,205,150,0.09)" stroke-width="1"/>
  <path d="M0 852 H${W}" stroke="rgba(255,205,150,0.06)" stroke-width="1"/>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.16" style="mix-blend-mode:overlay"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Cover 2 — data horizon                                              */
/* ------------------------------------------------------------------ */
function coverTrend() {
  const r = rng(91);
  let grid = '';
  const horizon = 486;
  for (let i = 0; i < 26; i += 1) {
    const t = i / 25;
    const y = horizon + Math.pow(t, 2.25) * (H - horizon) * 1.02;
    const o = (0.05 + t * 0.16).toFixed(3);
    grid += `<path d="M0 ${y.toFixed(1)} H${W}" stroke="rgba(126,240,200,${o})" stroke-width="1"/>`;
  }
  for (let i = -18; i <= 18; i += 1) {
    const x = 800 + i * 170;
    grid += `<path d="M800 ${horizon} L${x} ${H}" stroke="rgba(126,240,200,${(0.05 + Math.abs(i) * 0.0008).toFixed(3)})" stroke-width="1"/>`;
  }

  const pts = [
    [90, 742],
    [280, 706],
    [470, 660],
    [650, 686],
    [830, 590],
    [1010, 612],
    [1200, 470],
    [1390, 392],
    [1520, 320],
  ];

  const path = pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const [px, py] = pts[i - 1];
      const cx = (px + x) / 2;
      return `C${cx} ${py} ${cx} ${y} ${x} ${y}`;
    })
    .join(' ');
  const area = `${path} L${W} ${H} L0 ${H} Z`;

  let nodes = '';
  for (const [x, y] of pts) {
    nodes += `<circle cx="${x}" cy="${y}" r="16" fill="#7ef0c0" opacity="0.12"/>`;
    nodes += `<circle cx="${x}" cy="${y}" r="4.5" fill="#eafff6"/>`;
  }

  let cards = '';
  for (let i = 0; i < 4; i += 1) {
    const x = 120 + r() * 1280;
    const y = 90 + r() * 300;
    const w = 120 + r() * 150;
    const h = 54 + r() * 40;
    cards += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="10" fill="rgba(10,30,26,0.45)" stroke="rgba(140,255,215,${(0.1 + r() * 0.12).toFixed(2)})"/>`;
    cards += `<rect x="${(x + 16).toFixed(0)}" y="${(y + 16).toFixed(0)}" width="${(w * 0.42).toFixed(0)}" height="7" rx="3.5" fill="rgba(190,255,230,0.28)"/>`;
    cards += `<rect x="${(x + 16).toFixed(0)}" y="${(y + 32).toFixed(0)}" width="${(w * 0.66).toFixed(0)}" height="6" rx="3" fill="rgba(140,255,215,0.14)"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#050c0d"/>
      <stop offset="0.5" stop-color="#07131a"/>
      <stop offset="1" stop-color="#04100d"/>
    </linearGradient>
    ${softGradient('teal', [
      ['0', '#2ee0a6', '0.4'],
      ['0.5', '#1b8f74', '0.14'],
      ['1', '#1b8f74', '0'],
    ])}
    ${softGradient('warm', [
      ['0', '#ffcf8f', '0.26'],
      ['0.55', '#e0913f', '0.07'],
      ['1', '#e0913f', '0'],
    ])}
    <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7ef0c0" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#7ef0c0" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4fd3a6"/>
      <stop offset="0.55" stop-color="#a8ffd9"/>
      <stop offset="1" stop-color="#ffe2b0"/>
    </linearGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="vignette" cx="50%" cy="48%" r="70%">
      <stop offset="0.5" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.66"/>
    </radialGradient>
    ${grain}
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${glowCircle('teal', 300, 760, 720)}
  ${glowCircle('warm', 1380, 120, 560)}
  ${stars(311, 70, 420, '#d9fff1')}
  <g>${grid}</g>

  <path d="${area}" fill="url(#lineArea)"/>
  <path d="${path}" fill="none" stroke="url(#lineStroke)" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)"/>
  <path d="${path}" fill="none" stroke="#eafff7" stroke-width="1.3" stroke-linecap="round" opacity="0.85"/>
  ${nodes}

  <g opacity="0.9">${cards}</g>

  <path d="M0 ${horizon} H${W}" stroke="rgba(140,255,215,0.22)" stroke-width="1"/>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.15" style="mix-blend-mode:overlay"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Cover 3 — tracking reticle over a ridge                             */
/* ------------------------------------------------------------------ */
function coverMovtrak() {
  const cx = 800;
  const cy = 426;
  const s = 236;

  const bracket = (sx, sy, dx, dy) =>
    `<path d="M${sx + dx * 52} ${sy} H${sx} V${sy + dy * 52}" fill="none" stroke="#a9ecff" stroke-width="3.5" stroke-linecap="round" opacity="0.8"/>`;
  const corners = [
    bracket(cx - s, cy - s, 1, 1),
    bracket(cx + s, cy - s, -1, 1),
    bracket(cx - s, cy + s, 1, -1),
    bracket(cx + s, cy + s, -1, -1),
  ].join('');

  const r = rng(57);
  let streaks = '';
  for (let i = 0; i < 16; i += 1) {
    const y = 120 + r() * 640;
    const x = r() * 1400;
    const len = 60 + r() * 220;
    streaks += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} h${len.toFixed(0)}" stroke="rgba(150,220,255,${(0.03 + r() * 0.08).toFixed(3)})" stroke-width="${(0.6 + r() * 1.6).toFixed(1)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="#04060d"/>
      <stop offset="0.45" stop-color="#081322"/>
      <stop offset="0.78" stop-color="#0d2033"/>
      <stop offset="1" stop-color="#050a10"/>
    </linearGradient>
    ${softGradient('cyan', [
      ['0', '#5fc8f5', '0.32'],
      ['0.45', '#2b6fa8', '0.12'],
      ['1', '#2b6fa8', '0'],
    ])}
    ${softGradient('warm', [
      ['0', '#ffb774', '0.14'],
      ['1', '#ffb774', '0'],
    ])}
    <filter id="retGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <radialGradient id="vignette" cx="50%" cy="46%" r="70%">
      <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.7"/>
    </radialGradient>
    ${grain}
  </defs>

  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${glowCircle('cyan', 900, 420, 720)}
  ${glowCircle('warm', 240, 760, 520)}
  ${stars(88, 110, 500, '#dceeff')}
  ${streaks}

  ${ridge(52, 700, 190, 15, '#050a12', 'rgba(150,220,255,0.28)')}
  ${ridge(64, 790, 130, 18, '#03060b', 'rgba(150,220,255,0.16)')}

  <!-- reticle -->
  <g filter="url(#retGlow)">
    ${corners}
    <path d="M${cx - 26} ${cy} H${cx + 26}" stroke="#dff6ff" stroke-width="1.6"/>
    <path d="M${cx} ${cy - 26} V${cy + 26}" stroke="#dff6ff" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#dff6ff" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="132" fill="none" stroke="rgba(169,236,255,0.32)" stroke-width="1" stroke-dasharray="2 12"/>
    <circle cx="${cx}" cy="${cy}" r="88" fill="none" stroke="rgba(169,236,255,0.18)" stroke-width="1"/>
  </g>
  <!-- subject box -->
  <rect x="${cx - 154}" y="${cy - 118}" width="308" height="272" rx="18" fill="none" stroke="rgba(255,205,150,0.4)" stroke-width="1.6" stroke-dasharray="6 8"/>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.15" style="mix-blend-mode:overlay"/>
</svg>`;
}

/* ------------------------------------------------------------------ */
/* Favicon                                                             */
/* ------------------------------------------------------------------ */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6c68c"/>
      <stop offset="0.55" stop-color="#e9a25f"/>
      <stop offset="1" stop-color="#b46a30"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="15" fill="url(#g)"/>
  <text x="32" y="44" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#1b0f05">J</text>
</svg>`;

/* ------------------------------------------------------------------ */
/* JD Matcher mark                                                     */
/* ------------------------------------------------------------------ */
const jdMatcher = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#f7f2e8"/>
  <rect x="116" y="96" width="216" height="286" rx="30" fill="none" stroke="#17301f" stroke-width="20"/>
  <path d="M168 178h112M168 238h112M168 298h56" stroke="#17301f" stroke-width="18" stroke-linecap="round" opacity="0.55"/>
  <circle cx="340" cy="344" r="92" fill="#e9f7c9" stroke="#17301f" stroke-width="18"/>
  <path d="M298 344l30 30 56-66" fill="none" stroke="#17301f" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

await mkdir(out, { recursive: true });
await mkdir(join(root, 'images', 'projects'), { recursive: true });

await writeFile(join(out, 'hello.svg'), coverHello());
await writeFile(join(out, 'trend-catcher.svg'), coverTrend());
await writeFile(join(out, 'movtrak.svg'), coverMovtrak());
await writeFile(join(root, 'favicon.svg'), favicon);
await writeFile(join(root, 'images', 'projects', 'jd-matcher.svg'), jdMatcher);

console.log('artwork written');
