---
# ---------------------------------------------------------------------------
# Copy this file to src/content/posts/<slug>.md and fill in the values.
# The file name becomes the URL: /writing/<slug>/  (lowercase, hyphens)
#
# YAML rules that break the build — see "Strict rules" in README.md:
#   * wrap every text value in DOUBLE quotes (apostrophes and ": " are then safe)
#   * never indent with tabs, never repeat a key
#   * featured / draft take bare true or false, never yes/no
#   * date is YYYY-MM-DD and unquoted
#   * only the fields listed below exist; anything else is dropped silently
# ---------------------------------------------------------------------------
title: "<Your title, sentence case, one idea>"
description: "<One sentence. Used on cards, in search results and in the RSS feed.>"
date: 2026-01-01
# updated: 2026-01-02          # optional, only shown when you revise a post
author: "Junqian Chen"
tag: "Notes"                  # free-form: Notes, Build log, Product, Research, Workflow
cover: "/images/covers/<slug>.jpg"   # the file must exist in public/
coverAlt: "<Describe the cover image for screen readers>"
coverWidth: 1600              # intrinsic size of the cover file, unquoted number
coverHeight: 900
featured: false               # true pins it into the hero card on the home page
draft: false                  # true keeps it out of production builds (still visible in dev)
---

Open with the thing you actually want to say. Two or three short paragraphs, no heading —
the `description` above is the card excerpt, this is where you earn the click it promises.

## A section heading

Body copy in plain paragraphs. Inline `code`, [links](/writing), **bold** and *italic* all work.
Keep paragraphs short; the column is 700px wide.

<figure>
  <img src="/images/posts/<slug>/figure-name.webp" alt="What the image shows, concisely" width="1800" height="900" loading="lazy" />
  <figcaption>A caption that adds information the image cannot carry on its own.</figcaption>
</figure>

## A second section heading

### A small label

`h3` renders as a small uppercase label, useful for grouping inside a long section.

- A short list, when order does not matter.
- Keep items to one line where you can.
- Link out instead of re-explaining.

```bash
# Code blocks are syntax highlighted with the github-light theme.
npm run dev
```

> A pull quote for the one sentence you want people to remember.

## Numbers, if you have them

| Thing | What it costs |
| --- | --- |
| First row | Be concrete |
| Second row | Same unit, same scale |

---

Close with what changed, what you would do differently, or what comes next. Do not summarise
what the reader just read.
