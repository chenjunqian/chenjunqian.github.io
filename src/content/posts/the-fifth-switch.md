---
title: 'The fifth switch to DSH'
description: 'Six years after leaving VS Code for tmux, LazyVim and pi, I am moving my daily workflow into a browser — and this time I think I am staying.'
date: 2026-11-06
author: 'Junqian Chen'
tag: 'Workflow'
cover: '/images/covers/the-fifth-switch-ai.jpg'
coverAlt: 'A dark wall of stacked terminal panes on the left, a dotted line of five attempt marks, and a wide light browser-like workspace on the right, drawn in black ink on warm paper'
coverWidth: 1376
coverHeight: 768
draft: false
---

Six years ago, I spent almost half a year moving from VS Code into the terminal. This week I spent an evening moving back out.

Not to VS Code. To a browser.

For six years, build my dotfiles base on the tmux and neovim, and that time I think I just need the browser and terminal will finish all my work, I don't need to switch context by leaving terminal and the keyboard.

I use vscode since I start work, actually vscode is good enough for my daily workflow but since I need to maintain lots of different project I need to leave my hand from the keyboard to the mouse constantly, this will kind break my state of flow, and vscode-nvim is not complete implement the short cut, I have to adapt both vscode key-binding and the vim key-binding, I think why not just totally switch to neovim and tmux.

<figure>
  <img src="/images/posts/the-fifth-switch/tmux-sessions.webp" alt="Terminal screenshot showing the tmux session switcher with nine project sessions" width="1800" height="811" loading="lazy" />
  <figcaption>The tmux session switcher, open over a running pi session. A fairly complete map of my working life in AI era.</figcaption>
</figure>

<figure>
  <img src="/images/posts/the-fifth-switch/pi-tmux.webp" alt="Terminal screenshot with the dotfiles README on the left and a pi agent conversation on the right" width="1800" height="811" loading="lazy" />
  <figcaption>neovim on the left, pi on the right, all of it inside Ghostty and tmux.</figcaption>
</figure>

## 3 months to Neovim and Tmux

That is the COVID lock down, we start work from home and give me opportunity to switch to neovim and tmux setup, the whole 3 months in Shanghai, that is the most busy days in my whole career by now, I got multiple projects and processes in same time to push, I need to check the code, the ssh terminal, the logs and the local debug result, switch these in vscode, terminal and browser make me almost got the carpal tunnel syndrome, the tmux and neovim is the antidote.

Remember or adopt the key-binding of vim is painful at the first, but also I start enjoy this more and more.

## AI Era

For the vibe coding era, the tmux, neovim and pi workflow is good enough event in today. Split the tmux window, the left the is the neovim and the right is the pi agent, I review the changes by the neovim and lazygit, just like common AI agent does, but I think this is the FOMO make me or force me to change to GUI AI agent, and I choose DSH, it is also configurable like pi, I can build or change it for my own workflow.

Why not pi-gui? DSH is web UI by default, and I think the trend of AI agent is GUI, the official team will make new thing or concept first in GUI, for the FOMO, I just follow it.

As the model stronger and stronger, I don't need to review every single line of code, just need to check what it changes at high level, and the DSH can do this without any 3rd parts extensions (I installed the git extensions anyway)

<figure>
  <img src="/images/posts/the-fifth-switch/dsh-browser.webp" alt="DeepSeek Harness web interface with a chat, rendered diagrams, and a git history panel" width="1800" height="770" loading="lazy" />
  <figcaption></figcaption>
</figure>

I think I will still use tmux, neovim and pi sometime, but it will be gone finally, I write this just want to say goodbye to them.

