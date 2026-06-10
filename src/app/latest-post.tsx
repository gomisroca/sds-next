import Link from 'next/link';

import { db } from '@/server/db';

export const revalidate = 60;

async function getLatestPost() {
  return db.post.findFirst({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

function formatDate(date: Date | null) {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function LatestBlogPost() {
  const post = await getLatestPost();
  if (!post) return null;
  return (
    <Link key={post.id} href={`/blog/${post.slug}`} className="group mb-8 block">
      <article className="relative border border-red-900/20 bg-white/[0.02] transition-all duration-200 hover:border-red-800/35 hover:bg-white/[0.04]">
        <div className="absolute top-0 left-0 h-5 w-5 border-t border-l border-red-700/30" />
        <div className="absolute right-0 bottom-0 h-5 w-5 border-r border-b border-red-700/30" />

        {post.coverImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060404]/80 via-transparent to-transparent" />
          </div>
        )}

        <div className="p-7">
          <p className="mb-2 text-xs font-light tracking-[0.3em] text-white/20 uppercase">
            {formatDate(post.publishedAt)}
            {post.author.name && ` · ${post.author.name}`}
          </p>
          <h2 className="mb-3 text-xl font-light tracking-wide text-white/80 transition-colors group-hover:text-white/95">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-2 text-sm leading-relaxed font-light text-white/40">{post.excerpt}</p>
          )}
          <p className="mt-4 text-xs font-light tracking-[0.2em] text-red-700/50 uppercase transition-colors group-hover:text-red-600/70">
            Read more →
          </p>
        </div>
      </article>
    </Link>
  );
}
