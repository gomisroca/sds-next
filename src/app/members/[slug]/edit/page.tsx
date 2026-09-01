import { redirect } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { PageShell } from '@/app/components/ui/page-shell';
import ProfileWizard from '@/app/members/profile-wizard';
import type { ProfileFormData } from '@/app/members/profile-wizard/types';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export default async function EditProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/?toast=unauthorized');
  }

  const { slug } = await params;

  const profile = await db.profile.findUnique({
    where: { slug },
    select: {
      id: true,
      userId: true,
      name: true,
      bio: true,
      portrait: true,
      banner: true,
      job: true,
      activities: true,
      playstyle: true,
    },
  });

  if (!profile) redirect('/members');

  const editor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isOwner = profile.userId === session.user.id;
  const isLeader = editor?.role === 'LEADER';

  if (!isOwner && !isLeader) redirect(`/members/${profile.userId}`);

  const initialData: ProfileFormData = {
    name: profile.name,
    bio: profile.bio ?? '',
    job: profile.job,
    playstyle: profile.playstyle,
    activities: profile.activities,
    portrait: profile.portrait ?? '',
    banner: profile.banner ?? '',
  };

  return (
    <PageShell>
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Sleeping Dragons</p>
          <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/90 uppercase">Edit Profile</h1>
          <OrnamentalRule className="max-w-xs" />
          <p className="mt-6 text-sm font-light text-white/60">
            Editing <span className="text-white/60">{profile.name}</span>
          </p>
        </div>

        <ProfileWizard mode="edit" profileId={profile.id} initialData={initialData} />
      </div>
    </PageShell>
  );
}
