import { notFound, redirect } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

import PostEditor from '../../post-editor';

async function getPost(id: string) {
  return db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      published: true,
    },
  });
}

export default async function AdminBlogPostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    redirect('/admin');
  }

  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  return (
    <>
      <div className="mb-10">
        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin · Blog</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Edit Post</h1>
        <OrnamentalRule className="max-w-xs" />
        <p className="mt-6 text-sm font-light text-white/35">
          Editing <span className="text-white/60">{post.title}</span>
        </p>
      </div>

      <PostEditor
        mode="edit"
        postId={post.id}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          content: post.content as Record<string, unknown> | null,
          coverImage: post.coverImage ?? '',
          published: post.published,
        }}
      />
    </>
  );
}
