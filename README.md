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

Create `src/content/posts/<slug>.md`:

```markdown
---
title: 'A title that earns the click'
description: 'One sentence used on cards, in search results and in the RSS feed.'
date: 2026-11-04
author: 'Junqian Chen'
tag: 'Build log'          # free-form: Notes, Build log, Product…
cover: '/images/covers/hello.svg'
coverAlt: 'Describe the cover for screen readers'
featured: false           # true pins it to the home page
draft: false              # true hides it from production builds
---

Body starts here. Markdown, code blocks and images all work.
```

- The file name becomes the URL: `/writing/<slug>/`.
- `date` controls ordering; newest first.
- `featured: true` puts the post in the large hero card on the home page.
- Social previews use `<cover>-og.png`; generate it with `npm run art` (or point `cover` at a PNG).
- Delete the three seeded posts once you have your own.

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
