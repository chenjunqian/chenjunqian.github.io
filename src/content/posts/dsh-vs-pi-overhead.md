---
title: 'DSH vs pi: where the time and tokens go'
description: 'Source code level analyst. DSH 0.2.1-rc.3 (the running build) and 0.2.2-alpha.3 (the checkout) against pi, why the dsh cost more time and token to complete the same task'
date: 2026-11-04
author: 'Junqian Chen'
tag: 'Research'
cover: '/images/covers/dsh-vs-pi.jpg'
coverAlt: 'Illustration of a heavy blue DeepSeek Harness robot loaded with tools beside a small red pi robot riding a direct bash shell'
coverWidth: 1200
coverHeight: 670
---

*Source code level analyst. DSH 0.2.1-rc.3 (the running build) and 0.2.2-alpha.3 (the checkout) against pi, why the dsh cost more time and token to complete the same task*

I currently use pi as my primary agent for work and daily task with DeepSeek V4.1 flash, and always see people post how amazing that the result and benchmark they use the DeepSeek Harness with DeepSeek model, I tried but step back to pi because the time and the token that DSH takes per task. I wondering why such a amazing team build a harness that this slow and this much token consume compare to pi.

## 1. Parallelism is opt-in, per tool

<figure>
  <img src="/images/posts/dsh-vs-pi/fig1-gate.svg" alt="Fail-closed scheduling: only a tool returning true from isConcurrencySafe joins the pool" width="960" height="362" loading="lazy" />
  <figcaption>Fail-closed scheduling.</figcaption>
</figure>

Only a tool that returns `true` from `isConcurrencySafe()` joins the pool. Everything else — including read-only `grep` and `glob` — becomes an exclusive barrier.

## 2. Same message, different start times

<figure>
  <img src="/images/posts/dsh-vs-pi/fig2-timing.svg" alt="Two read calls start 1 ms apart; two grep calls start 99 ms apart" width="960" height="362" loading="lazy" />
  <figcaption>Start-time deltas.</figcaption>
</figure>

Two `read` calls start 1 ms apart; two `grep` calls 99 ms apart. The message is not serialized — the tools are.

## 3. The shell is not restricted. The prompt is.

<figure>
  <img src="/images/posts/dsh-vs-pi/fig3-lanes.svg" alt="One shell call in pi versus three serialized tool calls in DSH" width="960" height="362" loading="lazy" />
  <figcaption>One shell call vs three tool calls.</figcaption>
</figure>

`bash` runs `bash -c`; pipes and `&&` work (tested). But the prompt says "Use the grep tool — not shell grep or rg", so one compound command becomes three exclusive calls and three model turns.

## 4. Read-before-write

<figure>
  <img src="/images/posts/dsh-vs-pi/fig4-read.svg" alt="The read-before-write chain in DSH 0.2.1" width="960" height="362" loading="lazy" />
  <figcaption>Read-before-write chain.</figcaption>
</figure>

In 0.2.1, a write to an unread file fails with `FS_NOT_OBSERVED`. Only `read` records the observation, so `cat` does not help. New files skip the read.

**The team disabled this by default in 0.2.2 after benchmarking**, replacing it with `apply_patch`.

## 5. Two more mechanical costs

<figure>
  <img src="/images/posts/dsh-vs-pi/fig5-timeout.svg" alt="Commands longer than 120 seconds are promoted to background jobs, and every poll costs a turn" width="960" height="362" loading="lazy" />
  <figcaption>120 s timeout.</figcaption>
</figure>

Long commands are promoted at 120 s; every poll is a full turn.

<figure>
  <img src="/images/posts/dsh-vs-pi/fig8-metrics.svg" alt="Inventory of overhead mechanisms and what each one costs" width="960" height="240" loading="lazy" />
  <figcaption>Overhead inventory.</figcaption>
</figure>

## 6. Where the tokens actually go

<figure>
  <img src="/images/posts/dsh-vs-pi/fig6-token.svg" alt="Cost as the sum over turns of prefix plus history, with DSH starting smaller but growing faster" width="960" height="350" loading="lazy" />
  <figcaption>Token math: tokens ≈ steps × context, not prompt size.</figcaption>
</figure>

Step one is *smaller* in DSH (8.9k vs 14.5k input tokens). The gap is the number of turns, each resending the whole context.

## 7. Why this design

<figure>
  <img src="/images/posts/dsh-vs-pi/fig7-why.svg" alt="Three drivers behind DSH's design: concurrency correctness, auditability, product breadth" width="960" height="362" loading="lazy" />
  <figcaption>Three drivers.</figcaption>
</figure>

Concurrency is an information problem, not a model-IQ problem. Auditability and breadth are platform requirements. Only read-before-write was mainly a defensive default — and it lost its benchmark.

## Takeaway

- Not a pipe ban and not a global serial mode: **exclusive-by-default tool classification plus prompt routing**.
- Biggest removable costs: 31 always-on tools, the 120 s timeout, per-directory instruction injection, line-numbered reads.
- Read-before-write is already off by default in 0.2.2.

