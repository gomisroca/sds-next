import { Newspaper } from 'lucide-react';
import Link from 'next/link';

import { db } from '@/server/db';

import OrnamentalRule from '../components/ui/ornamental-rule';

export const revalidate = 60;

async function getPosts() {
  return db.post.findMany({
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

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main
      className="min-h-screen bg-[#060404] pt-14 text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)' }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,50,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,50,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/70 uppercase">Sleeping Dragons</p>
          <h1 className="mb-6 text-4xl font-extralight tracking-[0.1em] text-white/85 uppercase md:text-5xl">News</h1>
          <OrnamentalRule className="max-w-xs" />
          <p className="mt-6 text-sm font-light text-white/40">Updates, announcements, and stories from the Den.</p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Newspaper className="h-8 w-8 text-red-900/30" strokeWidth={1} />
            <p className="text-sm font-light tracking-widest text-white/20 uppercase">No posts yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
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
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
