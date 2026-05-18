import { redirect } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

import { ProfileWizard } from './profile-wizard';

// Officers can create a profile for any member who doesn't have one yet.
// The target user is passed as ?userId= in the query string.
export default async function NewProfilePage({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin');

  const creator = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!creator || (creator.role !== 'OFFICER' && creator.role !== 'LEADER')) {
    redirect('/members');
  }

  const { userId } = await searchParams;

  // If no userId provided, show a picker of members without profiles
  if (!userId) {
    const membersWithoutProfile = await db.user.findMany({
      where: {
        role: { notIn: ['GUEST'] },
        profile: null,
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, image: true, role: true },
    });

    return (
      <main
        className="min-h-screen bg-[#060404] pt-14 text-white"
        style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{ background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)' }}
        />

        <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
          <div className="mb-10">
            <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Sleeping Dragons</p>
            <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">New Profile</h1>
            <OrnamentalRule className="max-w-xs" />
            <p className="mt-6 text-sm font-light text-white/35">Select a member to create a profile for.</p>
          </div>

          {membersWithoutProfile.length === 0 ? (
            <p className="text-sm font-light text-white/25 italic">All members already have profiles.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {membersWithoutProfile.map((user) => (
                <a
                  key={user.id}
                  href={`/members/new?userId=${user.id}`}
                  className="flex items-center gap-4 border border-red-900/20 bg-white/[0.02] px-5 py-3 transition-colors hover:border-red-800/40 hover:bg-white/[0.04]">
                  {user.image && (
                    <img src={user.image} alt="" className="h-7 w-7 rounded-full ring-1 ring-red-900/30" />
                  )}
                  <span className="text-sm font-light text-white/70">{user.name ?? 'Unknown'}</span>
                  <span className="ml-auto text-xs font-light tracking-widest text-white/25 uppercase">
                    {user.role}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // userId provided - load that user and show the wizard
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, profile: { select: { id: true } } },
  });

  if (!targetUser || targetUser.role === 'GUEST') redirect('/members/new');
  if (targetUser.profile) redirect(`/members/${targetUser.id}`); // already has one

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
          <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">New Profile</h1>
          <OrnamentalRule className="max-w-xs" />
        </div>

        <ProfileWizard mode="create" targetUserId={targetUser.id} targetUserName={targetUser.name ?? 'Unknown'} />
      </div>
    </main>
  );
}
