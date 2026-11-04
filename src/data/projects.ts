export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  name: string;
  kicker: string;
  year: string;
  status: string;
  tagline: string;
  description: string;
  stack: string[];
  links: ProjectLink[];
  icon: string;
  tintA: string;
  tintB: string;
  features: string[];
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: 'porkast',
    name: 'Porkast',
    kicker: 'Podcast platform',
    year: '2023 — now',
    status: 'Live',
    tagline: 'Podcasts, keyword feeds and a bot that does the listening legwork.',
    description:
      'A podcast discovery and subscription platform built around keywords instead of shows. Search millions of podcasts, subscribe to topics, and turn any subscription or playlist into a personal RSS feed that works in Overcast, Pocket Casts or Apple Podcasts. A Telegram bot keeps the whole library within thumb reach.',
    stack: ['React', 'Vite', 'Cloudflare Workers', 'D1', 'Telegram'],
    links: [
      { label: 'porkast.com', href: 'https://porkast.com' },
      { label: 'Telegram bot', href: 'https://t.me/PorkcastBot' },
    ],
    icon: '/images/projects/porkast.png',
    tintA: 'rgba(233, 162, 95, 0.46)',
    tintB: 'rgba(168, 62, 36, 0.34)',
    features: [
      'Keyword subscriptions that auto-collect matching episodes',
      'Personal RSS feeds generated from playlists and queues',
      'Telegram bot and mini app for on-the-go management',
    ],
    featured: true,
  },
  {
    slug: 'trend-catcher',
    name: 'Trend Catcher',
    kicker: 'AI trend radar · 猎趋',
    year: '2026 — now',
    status: 'Live',
    tagline: 'The daily signal check for people who ship small things.',
    description:
      'Every morning it scrapes Product Hunt, Hacker News and GitHub Trending, then asks DeepSeek to write a bilingual digest with category tags. Every Sunday it reads its own week back and writes the cross-source trend synthesis. Reports land on a PWA dashboard and in your inbox.',
    stack: ['Hono', 'Cloudflare Workers', 'D1', 'DeepSeek', 'PWA'],
    links: [
      { label: 'trendcatcher.guoshaotech.com', href: 'https://trendcatcher.guoshaotech.com' },
      { label: 'GitHub', href: 'https://github.com/chenjunqian/trend-catcher' },
    ],
    icon: '/images/projects/trend-catcher.png',
    tintA: 'rgba(96, 200, 168, 0.42)',
    tintB: 'rgba(38, 92, 148, 0.4)',
    features: [
      'Three sources, one ranked daily report',
      'English + Chinese summaries written by an LLM',
      'Sunday weekly synthesis, email newsletter, installable PWA',
    ],
    featured: true,
  },
  {
    slug: 'movtrak',
    name: 'MovTrak',
    kicker: 'iOS app',
    year: '2025 — now',
    status: 'Live',
    tagline: 'A camera that follows the climber, not the other way around.',
    description:
      'MovTrak turns an iPhone into a motion-tracking camera. Apple Vision finds the person in frame and a smoothing layer keeps them centred while they climb, lift or run — so a single phone on a tripod can produce footage that looks like it had an operator behind it.',
    stack: ['SwiftUI', 'Apple Vision', 'AVFoundation', 'iOS 18'],
    links: [
      { label: 'movtrak.app', href: 'https://movtrak.app' },
      { label: 'App Store', href: 'https://apps.apple.com/app/movtrak/id6755912677' },
    ],
    icon: '/images/projects/movtrak.png',
    tintA: 'rgba(96, 186, 220, 0.4)',
    tintB: 'rgba(52, 74, 160, 0.44)',
    features: [
      'Real-time person detection and automatic centring',
      'Smooth, camera-like tracking without a gimbal',
      'Zero third-party computer-vision dependencies',
    ],
  },
  {
    slug: 'jd-matcher',
    name: 'JD Matcher',
    kicker: 'AI agent skill',
    year: '2024 — now',
    status: 'Open source',
    tagline: 'A job search that reads every listing so you do not have to.',
    description:
      'JD Matcher pairs a candidate profile with live job postings. It runs in two shapes: a local-first agent skill that stores postings as a markdown knowledge base and ships a frosted-glass dashboard, or a 24/7 Cloudflare stack with D1, Vectorize, Queues and Telegram alerts that keeps watching while you sleep.',
    stack: ['TypeScript', 'Cloudflare', 'LLM', 'Telegram', 'Markdown KB'],
    links: [
      { label: 'Telegram bot', href: 'https://t.me/JDMatcherBot' },
      { label: 'GitHub', href: 'https://github.com/chenjunqian/jd-matcher' },
    ],
    icon: '/images/projects/jd-matcher.svg',
    tintA: 'rgba(190, 226, 110, 0.36)',
    tintB: 'rgba(90, 120, 60, 0.38)',
    features: [
      'Veto gates that reject mismatched jobs before scoring',
      'Portable agent skill: Claude Code, Codex, Pi, Cursor, Antigravity',
      'Serverless daemon with Telegram and email notifications',
    ],
  },
];

export const socials = {
  github: 'https://github.com/chenjunqian',
  email: 'chenjunqian0810@foxmail.com',
  telegram: 'https://t.me/PorkcastBot',
  rss: '/rss.xml',
};
