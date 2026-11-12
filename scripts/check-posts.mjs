// Preflight check for src/content/posts/*.md
//
// Astro parses post frontmatter as YAML and then validates it against the zod
// schema in src/content.config.ts. When either step fails, the whole build dies
// with a stack trace from js-yaml or from zod, and in dev the page just 404s.
// This script fails fast with a message that names the file, the line and the
// fix, and catches the markdown mistakes that only show up later (missing
// cover file, relative image paths, unclosed <figure>).
//
// Run: npm run check:posts   (also runs automatically before `npm run build`)

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { load } from 'js-yaml';

const POSTS_DIR = 'src/content/posts';
const PUBLIC_DIR = 'public';

const REQUIRED = ['title', 'description', 'date', 'cover'];
const STRINGS = ['title', 'description', 'author', 'tag', 'cover', 'coverAlt'];
const NUMBERS = ['coverWidth', 'coverHeight'];
const BOOLEANS = ['featured', 'draft'];
const KNOWN = [...STRINGS, ...NUMBERS, ...BOOLEANS, 'date', 'updated'];

const errors = [];
const warnings = [];

const rel = (p) => relative(process.cwd(), p);

function error(file, line, message, hint) {
  errors.push({ file: rel(file), line, message, hint });
}

function warn(file, line, message, hint) {
  warnings.push({ file: rel(file), line, message, hint });
}

/** Returns [frontmatterSource, bodySource, indexOfBodyLine]. */
function splitFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) return null;
  return { frontmatter: match[1], body: text.slice(match[0].length) };
}

/** YAML error line numbers are 1-based relative to the frontmatter block. */
function yamlLine(err) {
  return err.mark?.line != null ? err.mark.line + 2 : 1;
}

function checkDateString(file, value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.valueOf())) {
      error(file, 1, '`date` is not a valid date.');
      return false;
    }
    return true;
  }
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const roundTrip = new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10);
      if (roundTrip !== value) {
        error(
          file,
          1,
          `\`date: ${value}\` is not a real calendar day (it rolls over to ${roundTrip}).`,
          'Check the month and day.',
        );
        return false;
      }
      return true;
    }
    warn(
      file,
      1,
      `\`date: ${value}\` is not in YYYY-MM-DD form; it is read in the build machine's timezone and can shift a day.`,
      'Write dates as 2026-11-04.',
    );
  }
  return true;
}

async function checkImages(file, body) {
  // Markdown images are resolved by Astro's image pipeline: a relative path to a
  // file that does not exist fails the build with [ImageNotFound].
  const mdImage = /!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g;
  for (const m of body.matchAll(mdImage)) {
    const src = m[1];
    if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) continue;
    if (!src.startsWith('/')) {
      error(
        file,
        null,
        `Markdown image \`${src}\` uses a relative path, which Astro tries to import — if the file is missing the build fails with [ImageNotFound].`,
        'Put the file in public/images/posts/<slug>/ and reference it as /images/posts/<slug>/file.webp, or use a <figure> with <img> as the template does.',
      );
      continue;
    }
    if (!existsSync(join(PUBLIC_DIR, src))) {
      warn(file, null, `Image \`${src}\` does not exist in ${PUBLIC_DIR}/ — the page will show a broken image.`);
    }
  }

  // Raw HTML <img> is passed through untouched, so a bad path is silent.
  const htmlImage = /<img\b[^>]*\bsrc=["']([^"']+)["']/g;
  for (const m of body.matchAll(htmlImage)) {
    const src = m[1];
    if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) continue;
    if (!existsSync(join(PUBLIC_DIR, src))) {
      warn(file, null, `The page will show a broken image: \`${src}\` does not exist in ${PUBLIC_DIR}/.`);
    }
  }

  const opens = (body.match(/<figure\b/g) || []).length;
  const closes = (body.match(/<\/figure>/g) || []).length;
  if (opens !== closes) {
    warn(
      file,
      null,
      `Unbalanced <figure> tags (${opens} open, ${closes} close). Everything after an unclosed <figure> is swallowed into the figure and loses its styling.`,
    );
  }
}

function checkCover(file, cover) {
  if (!existsSync(join(PUBLIC_DIR, cover))) {
    error(
      file,
      null,
      `\`cover: ${cover}\` does not exist in ${PUBLIC_DIR}/. The card, the article header and the Open Graph image will all be broken.`,
      'Add the file, or point cover at an existing cover in public/images/covers/.',
    );
    return;
  }
  // src/pages/writing/[slug].astro derives the social image from the cover name.
  const isSvg = extname(cover).toLowerCase() === '.svg';
  const og = cover.replace(/\.(svg|jpe?g|png|webp)$/i, isSvg ? '-og.png' : '-og.jpg');
  if (!existsSync(join(PUBLIC_DIR, og))) {
    warn(
      file,
      null,
      `No Open Graph image for this cover (looked for ${og}). Social previews will 404.`,
      'Run `npm run art` if this cover was generated by scripts/, otherwise add the -og file.',
    );
  }
}

async function checkPost(file) {
  const raw = await readFile(file, 'utf8');
  const split = splitFrontmatter(raw);

  if (!split) {
    error(
      file,
      1,
      'No frontmatter block. The file must start with a line containing exactly `---`.',
      'Without it every schema field is missing and the entry fails validation.',
    );
    return;
  }

  let data;
  try {
    data = load(split.frontmatter) ?? {};
  } catch (err) {
    error(
      file,
      yamlLine(err),
      `YAML will not parse: ${(err.reason || err.message).split('\n')[0]}`,
      'Usual causes: an unquoted value containing ": ", an apostrophe inside single quotes (\'It\'s\'), a value starting with - * & ? [ { > |, a tab, or the same key twice.',
    );
    return;
  }

  if (typeof data !== 'object' || Array.isArray(data)) {
    error(file, 1, 'Frontmatter must be a mapping of keys to values.');
    return;
  }

  for (const key of Object.keys(data)) {
    if (!KNOWN.includes(key)) {
      warn(
        file,
        null,
        `Unknown field \`${key}\` — it is not in src/content.config.ts, so it is dropped without warning.`,
        `Known fields: ${KNOWN.join(', ')}. Check for a typo.`,
      );
    }
  }

  for (const key of REQUIRED) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      error(file, null, `Missing required field \`${key}\`.`, 'See templates/post.md for the full set.');
    }
  }

  for (const key of STRINGS) {
    if (data[key] !== undefined && typeof data[key] !== 'string') {
      error(file, null, `\`${key}\` must be text. Quote it: ${key}: "..."`);
    }
  }
  for (const key of NUMBERS) {
    if (data[key] !== undefined && typeof data[key] !== 'number') {
      error(file, null, `\`${key}\` must be a number without quotes.`);
    }
  }
  for (const key of BOOLEANS) {
    if (data[key] !== undefined && typeof data[key] !== 'boolean') {
      error(
        file,
        null,
        `\`${key}\` must be exactly true or false, got ${JSON.stringify(data[key])}.`,
        key === 'featured' ? '`featured: yes` is a string, not a boolean.' : undefined,
      );
    }
  }

  for (const key of ['date', 'updated']) {
    if (data[key] !== undefined && !checkDateString(file, data[key])) return;
  }

  if (typeof data.title === 'string' && data.title.length > 70) {
    warn(file, null, `Title is ${data.title.length} characters; it will wrap to three lines on the cards.`);
  }
  if (typeof data.description === 'string' && data.description.length > 200) {
    warn(file, null, `Description is ${data.description.length} characters; the card and RSS excerpt will be cut off.`);
  }

  if (typeof data.cover === 'string') checkCover(file, data.cover);
  await checkImages(file, split.body);
}

async function main() {
  let entries;
  try {
    entries = await readdir(POSTS_DIR, { withFileTypes: true });
  } catch {
    console.error(`Cannot read ${POSTS_DIR}. Run this from the repository root.`);
    process.exit(1);
  }

  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => join(POSTS_DIR, e.name));

  if (files.length === 0) {
    console.log('No posts to check.');
    return;
  }

  for (const file of files) await checkPost(file);

  const ids = new Map();
  for (const file of files) {
    const id = file.slice(POSTS_DIR.length + 1, -3);
    if (ids.has(id)) error(file, null, `Duplicate post id "${id}".`);
    ids.set(id, file);
    if (!/^[a-z0-9-]+$/.test(id)) {
      warn(file, null, `File name "${id}.md" makes an awkward URL /writing/${id}/.`, 'Use lowercase words and hyphens.');
    }
  }

  const print = (list, label) => {
    for (const item of list) {
      const where = `${item.file}${item.line ? `:${item.line}` : ''}`;
      console.log(`\n${label} ${where}\n  ${item.message}`);
      if (item.hint) console.log(`  → ${item.hint}`);
    }
  };

  print(warnings, 'warning');
  print(errors, 'error');

  console.log(
    `\n${files.length} post(s) checked: ${errors.length} error(s), ${warnings.length} warning(s).`,
  );
  if (errors.length > 0) {
    console.log('Fix the errors above, then re-run `npm run check:posts`.');
    process.exit(1);
  }
}

main();
