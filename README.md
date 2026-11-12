# chenjunqian.github.io

Personal site and writing — a small, fast, dark-mode blog built with Astro and deployed to GitHub Pages.

Three things live here:

- **Writing** — build logs and product notes, stored as Markdown in `src/content/posts/`.
- **Projects** — Porkast, Trend Catcher, MovTrak and JD Matcher, described in `src/data/projects.ts`.
- **About** — the longer version of who I am, in `src/pages/about.astro`.

The visual language (dense card grid, serif headlines, sidebar of recent writing) is borrowed from the [Cline blog](https://cline.bot/blog).

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | [Astro 5](https://astro.build) — static output, zero client framework |
| Content | Markdown + Astro content collections |
| Styling | Hand-written CSS with custom properties (no Tailwind) |
| Fonts | Self-hosted via Fontsource: Instrument Serif, Inter, Newsreader |
| Deploy | GitHub Actions → GitHub Pages |

The only JavaScript on the page is the mobile navigation toggle.

## Local development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # preview the production build
```

## Writing a post

```bash
cp templates/post.md src/content/posts/<slug>.md   # file name = /writing/<slug>/
npm run check:posts                                # validate before you build
```

`templates/post.md` holds the annotated frontmatter. It lives outside `src/content/posts/` so it
is never built as a post. `npm run build` runs the same check first (via `prebuild`), so a broken
post fails with a readable message instead of a js-yaml stack trace.

Conventions:

- The file name becomes the URL: `/writing/<slug>/`. Lowercase and hyphens.
- `date` in `YYYY-MM-DD` form, unquoted. It controls ordering, newest first.
- `featured: true` puts the post in the large hero card on the home page.
- Social previews use `<cover>-og.jpg` (`-og.png` for SVG covers); generate it with `npm run art`.
- Inline images go in `public/images/posts/<slug>/` and are referenced with a `<figure>` block
  (see the template) so they get a rounded frame and a caption.
- Delete the three seeded posts once you have your own.

### Strict rules — what actually breaks the build

Frontmatter is YAML, parsed by js-yaml, then validated by the zod schema in
`src/content.config.ts`. Either step failing kills the whole build, and in `npm run dev` the post
just 404s until you fix it. All of the following were reproduced against this repo:

**Fails the build (YAML):**

| Write | Not | Why |
| --- | --- | --- |
| `title: "DSH vs pi: where the time goes"` | `title: DSH vs pi: where the time goes` | an unquoted `: ` starts a nested mapping |
| `title: "James's tool"` | `title: 'James's tool'` | the apostrophe closes the quote early |
| `title: "— dash start"` | `title: - dash start` | a leading `-`, `*`, `&`, `?`, `[`, `{`, `>`, `|`, `%`, `@` means YAML syntax |
| `title: "unbalanced` | | unterminated quote |
| one key, once | `title:` twice | duplicate keys are a hard error, not last-wins |
| spaces | tab indentation | tabs are illegal in YAML indentation |

Rule of thumb: wrap every text value in double quotes. Double quotes tolerate apostrophes and
colons; single quotes do not tolerate apostrophes.

**Fails the build (schema):**

- `title`, `description`, `date`, `cover` are required — a typo in the key name (`descripton:`)
  reads as a missing field, and unknown fields are dropped silently.
- `featured` and `draft` must be bare `true` / `false`. `featured: yes` is the string `"yes"` and
  is rejected.
- `coverWidth`, `coverHeight` must be unquoted numbers.
- `date: 2026-02-30` is not a real day; JavaScript silently rolls it to March 2.
- An empty file or a missing `---` block fails validation.

**Fails the build (markdown):**

- `![alt](./relative.png)` — Astro resolves markdown images through its image pipeline, so a
  relative path that does not exist fails with `[ImageNotFound]`. Use `/images/...` absolute
  paths, or the `<figure>` + `<img>` form from the template.

**Builds fine but renders wrong (the silent ones `check:posts` warns about):**

- an unclosed `<figure>` swallows every following paragraph into the figure;
- `cover:` pointing at a missing file leaves the card, header and OG image broken;
- a missing `<cover>-og.jpg` 404s only in social previews;
- dates like `date: "Nov 4, 2026"` are parsed in the build machine's timezone and can shift a day;
- unknown frontmatter keys, including a misspelled `featured`.

Raw HTML inside markdown is passed through untouched, so any HTML you write is your own
responsibility: unbalanced tags, `<script>`, and stray `<` are not repaired by the renderer.

## Editing projects

All project metadata — name, description, stack, links, cover tints, features — lives in
`src/data/projects.ts`. Project icons are in `public/images/projects/`.

## Artwork and images

`scripts/generate-art.mjs` draws the abstract covers, favicon and the JD Matcher mark as SVG
(deterministic, no external services). `scripts/og.mjs` renders the Open Graph card with a
headless Chromium.

```bash
npm run art
```

To use a different cover, drop an image into `public/images/covers/` and reference it from the
post frontmatter. To regenerate the JD Matcher icon, edit the inline SVG at the end of
`scripts/generate-art.mjs`.

## Analytics

Cloudflare Web Analytics: free, cookie-free, no consent banner, and it needs no DNS or proxy
change — the site stays on GitHub Pages. The beacon is injected once in `src/layouts/Base.astro`,
so every route (including `/404`) is tracked and new pages inherit it for free.

To turn it on:

1. Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site**
2. Hostname `chenjunqian.github.io`, then choose the **JS snippet** path (the site is not proxied,
   so automatic setup does not apply)
3. Copy the `token` value from the snippet
4. Paste it into `src/data/analytics.ts` and push

Nothing is emitted while the token is empty, and nothing is emitted in `npm run dev`, so local
work does not pollute the numbers.

What it gives you: page views per path (`/writing/<slug>` rolls up per article), referrers, top
pages, countries, devices, and Core Web Vitals.

What it does not give you:

- **Query strings are not logged**, so UTM tags are invisible. Traffic from X, Reddit or an HN
  client that strips `Referer` shows up as "Direct".
- Unsampled beacons are kept **7 days**; after that data is aggregated to ~10% for **6 months**.
  Article totals stay meaningful, narrow long-range filters do not.
- No custom events, so no scroll depth or "read to the end".
- `cloudflareinsights.com` is on ad-blocker lists, so expect an undercount.

If referrer/UTM attribution ever matters more than the setup cost, the upgrade path is a small
Worker that writes `path + referrer + utm_* + country` to Workers Analytics Engine — included in
the Workers Paid plan, 3 months retention, queried with SQL.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes
`dist/` to GitHub Pages. In the repository settings, **Pages → Build and deployment → Source**
must be set to **GitHub Actions** (only needs doing once).

The `site` value in `astro.config.mjs` is used for canonical URLs, the sitemap and RSS. Update it
if you move to a custom domain.

## Project structure

```
src/
  components/     Header, Footer, cards, recent-writing sidebar
  content/posts/  Markdown posts
  data/           Project metadata and social links
  layouts/        Base layout (head, meta, fonts)
  lib/            Date formatting and post helpers
  pages/          Routes: /, /writing, /writing/[slug], /projects, /about, /rss.xml
  styles/         global.css
public/
  images/         Covers, avatars, project icons, OG card
scripts/          Artwork and OG generators
```
