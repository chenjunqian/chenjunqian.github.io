---
title: 'Reading the whole internet, once a day'
description: 'Trend Catcher turns Product Hunt, Hacker News and GitHub Trending into one bilingual morning report. The scraping was easy; deciding what matters was not.'
date: 2026-10-12
author: 'Junqian Chen'
tag: 'Product'
cover: '/images/covers/trend-catcher.svg'
coverAlt: 'A glowing ascending line chart above a dark perspective grid'
---

For a while my mornings looked like this: open Product Hunt, skim the top ten, open Hacker News, skim the front page, open GitHub Trending, skim the repositories, close all three tabs, and retain roughly two facts. The sources overlap, the interesting signal is buried under launch-day enthusiasm, and none of them write for someone who builds small products alone.

Trend Catcher is my attempt to compress that loop into one report. Every morning it reads all three sources, writes a bilingual summary, and puts it on a dashboard and in an inbox. Every Sunday it reads its own week back and writes the cross-week synthesis.

## The pipeline

The architecture is deliberately unglamorous:

- A Cloudflare cron job wakes up, fetches Product Hunt, Hacker News and GitHub Trending, and normalises them into a common shape.
- DeepSeek writes the daily report: what launched, what the discussion was actually about, which repositories gained traction. English and Chinese in the same pass.
- Everything lands in D1. A Hono app on Workers serves the dashboard, the report permalinks, the RSS-ish timeline and the newsletter.
- On Sundays, a second prompt reads the week of reports and writes a synthesis that no single day's report could contain.

There is no vector database and no recommender. The product is a well-edited digest, not a personalised feed. That is a feature: the value is in the editing, and editing is exactly what an LLM is good at when you give it a narrow job.

## Why bilingual

I read English sources all day and think in Chinese. Most AI-generated digests pick one language and do it badly in the other. Generating both in one pass, from the same underlying facts, keeps the two versions honest with each other — and it costs almost nothing extra.

It also makes the product usable by two audiences I actually know: the English-speaking indie hacker crowd, and the Chinese developers who would rather not translate a Hacker News thread at 8am.

## What surprised me

**Aggregation is cheap; judgement is not.** Fetching three APIs and dumping the results into a prompt took an afternoon. Getting the output to stop sounding like a press release took weeks.

**Deduplication is the real feature.** The same launch appears on Product Hunt and Hacker News, the same repository trends for three days. A digest that repeats itself is worse than no digest. Collapsing near-duplicates before the model sees them improved the output more than any prompt rewrite.

**Weekly is a different product.** Daily reports answer "what happened". The weekly synthesis answers "what is changing". The second question is the one I actually care about, and it needs a different prompt, a different length, and a different level of confidence.

**Newsletter deliverability is infrastructure.** Double opt-in, one-click unsubscribe, a real domain, and a plain-text fallback are not glamorous, but they are the difference between a hobby and something people can rely on.

## Where it is

Trend Catcher runs at [trendcatcher.guoshaotech.com](https://trendcatcher.guoshaotech.com). It is a PWA, so it installs on a phone and works offline once a report has been read. The source is on [GitHub](https://github.com/chenjunqian/trend-catcher).

The next thing I want to add is not another source. It is a way to mark a report as "this mattered" and have the weekly synthesis learn from those marks. The model is already good at summarising; the missing piece is memory of what I found useful.
