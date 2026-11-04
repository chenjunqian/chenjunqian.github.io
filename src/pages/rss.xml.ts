import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: 'Junqian Chen — Writing',
    description: 'Notes on shipping products, AI agents and infrastructure, from Shanghai.',
    site: context.site ?? 'https://chenjunqian.github.io',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writing/${post.id}/`,
      categories: [post.data.tag],
      author: post.data.author,
    })),
    customData: '<language>en-us</language>',
  });
}
