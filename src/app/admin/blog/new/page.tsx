import { redirect } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

import PostEditor from '../post-editor';

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    redirect('/admin');
  }

  return (
    <>
      <div className="mb-10">
        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin · Blog</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">New Post</h1>
        <OrnamentalRule className="max-w-xs" />
      </div>

      <PostEditor mode="new" />
    </>
  );
}
