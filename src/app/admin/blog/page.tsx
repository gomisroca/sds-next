import { FileText, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';

import { CornerAccent } from '@/app/components/ui/corner-accent';
import { AdminPageHeader } from '@/app/components/ui/page-header';
import { SectionDivider } from '@/app/components/ui/section-divider';
import { db } from '@/server/db';

import AdminActionButton from '../admin-action-button';

export const dynamic = 'force-dynamic';

async function getPosts() {
  return db.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      published: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });
}

export default async function AdminBlogPage() {
  const posts = await getPosts();
  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);

  return (
    <>
      <AdminPageHeader
        title="Blog Posts"
        subtitle={`${posts.length} post${posts.length !== 1 ? 's' : ''} total — ${published.length} published, ${drafts.length} draft${drafts.length !== 1 ? 's' : ''}.`}
        action={
          <AdminActionButton href="/admin/blog/new">
            <Plus className="h-3 w-3" strokeWidth={2} />
            New Post
          </AdminActionButton>
        }
      />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <FileText className="h-8 w-8 text-red-900/30" strokeWidth={1} />
          <p className="text-sm font-light tracking-widest text-white/60 uppercase">No posts yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {[
            { label: 'Published', items: published },
            { label: 'Drafts', items: drafts },
          ]
            .filter((g) => g.items.length > 0)
            .map(({ label, items }) => (
              <section key={label}>
                <div className="mb-4 flex items-center gap-4">
                  <span
                    className={`text-[10px] font-light tracking-[0.3em] uppercase ${
                      label === 'Published' ? 'text-emerald-500/60' : 'text-yellow-600/60'
                    }`}>
                    {label} ({items.length})
                  </span>
                  <SectionDivider />
                </div>

                <div className="flex flex-col gap-2">
                  {items.map((post) => (
                    <div
                      key={post.id}
                      className="relative flex items-center gap-4 border border-red-900/15 bg-white/[0.02] px-5 py-4 transition-colors hover:border-red-900/25">
                      <CornerAccent />

                      {/* Thumbnail */}
                      {post.coverImage ? (
                        <div className="h-12 w-16 shrink-0 overflow-hidden border border-red-900/20">
                          <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center border border-red-900/15 bg-red-950/10">
                          <FileText className="h-4 w-4 text-red-900/30" strokeWidth={1} />
                        </div>
                      )}

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-light text-white/80">{post.title}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs font-light text-white/60">
                          <span>/blog/{post.slug}</span>
                          {post.author.name && <span>by {post.author.name}</span>}
                          <span>
                            {post.published && post.publishedAt
                              ? `Published ${post.publishedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                              : `Created ${post.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        {post.published && (
                          <Link
                            href={`/blog/${post.slug}`}
                            className="border border-red-900/20 px-3 py-1.5 text-[10px] font-light tracking-[0.2em] text-white/60 uppercase transition-all hover:border-red-800/35 hover:text-white/90">
                            View
                          </Link>
                        )}
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="flex items-center gap-1.5 border border-red-900/20 px-3 py-1.5 text-[10px] font-light tracking-[0.2em] text-white/60 uppercase transition-all hover:border-red-800/35 hover:text-white/90">
                          <Pencil className="h-2.5 w-2.5" strokeWidth={1.5} />
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
