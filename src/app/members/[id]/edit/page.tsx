import { redirect } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

import { ProfileWizard } from '../../new/profile-wizard';
import type { ProfileFormData } from '../../new/types';

export default async function EditProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin');

  const { id } = await params;

  const profile = await db.profile.findUnique({
    where: { id },
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

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <div className="mb-10">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Sleeping Dragons</p>
          <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Edit Profile</h1>
          <OrnamentalRule className="max-w-xs" />
          <p className="mt-6 text-sm font-light text-white/35">
            Editing <span className="text-white/60">{profile.name}</span>
          </p>
        </div>

        <ProfileWizard mode="edit" profileId={profile.id} initialData={initialData} />
      </div>
    </main>
  );
}
