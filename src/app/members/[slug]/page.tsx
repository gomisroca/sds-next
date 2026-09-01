import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageShell } from '@/app/components/ui/page-shell';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { ACTIVITY_LABEL, JOB_META, PLAYSTYLE_META, ROLE_META } from '@/utils/profile';

export const dynamic = 'force-dynamic';

async function getMember(slug: string) {
  return db.profile.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      bio: true,
      portrait: true,
      banner: true,
      job: true,
      activities: true,
      playstyle: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });
}

export default async function MemberDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [session, profile] = await Promise.all([auth(), getMember(slug)]);
  if (!profile) notFound();

  const displayName = profile.name ?? profile.user.name ?? 'Unknown';
  const portrait = profile.portrait ?? profile.user.image;
  const roleMeta = ROLE_META[profile.user.role];

  // Show edit button to profile owner or leaders
  const currentUser = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    : null;
  const canEdit = profile && (session?.user?.id === profile.user.id || currentUser?.role === 'LEADER');

  return (
    <PageShell>
      {/* Banner */}
      {profile?.banner && (
        <div className="relative h-48 w-full overflow-hidden md:h-64">
          <img src={profile.banner} alt="" aria-hidden className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#060404]" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-12">
        {/* Back */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/members"
            className="group inline-flex items-center gap-2 text-xs font-light tracking-[0.25em] text-white/60 uppercase transition-colors duration-200 hover:text-white/90">
            <ArrowLeft
              className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5"
              strokeWidth={1.5}
            />
            All Members
          </Link>

          {canEdit && profile && (
            <Link
              href={`/members/${profile.id}/edit`}
              className="flex items-center gap-2 border border-red-900/25 bg-white/[0.02] px-4 py-1.5 text-xs font-light tracking-[0.2em] text-white/60 uppercase transition-all hover:border-red-800/40 hover:text-white/90">
              <Pencil className="h-3 w-3" strokeWidth={1.5} />
              Edit Profile
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Portrait + identity */}
          <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
            {/* Portrait */}
            <div className="relative h-48 w-36 overflow-hidden border border-red-900/25 bg-red-950/20">
              {portrait ? (
                <img src={portrait} alt={displayName} className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-5xl font-extralight text-red-900/40">{displayName[0]?.toUpperCase()}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060404]/60 to-transparent" />
            </div>

            {/* Name + role */}
            <div>
              <h1 className="text-2xl font-extralight tracking-wide text-white/90 md:text-3xl">{displayName}</h1>
              <p className={`mt-1 text-xs font-light tracking-[0.25em] uppercase ${roleMeta.color}`}>
                {roleMeta.label}
              </p>
            </div>

            {/* Member since */}
            <p className="text-xs font-light text-white/60">
              Member since {profile.user.createdAt.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Profile details */}
          <div className="md:col-span-2">
            {profile ? (
              <div className="flex flex-col gap-8">
                {/* Job + playstyle */}
                <div className="flex flex-wrap gap-3">
                  <div className={`flex items-center border px-3 py-1.5 ${JOB_META[profile.job].bg} border-current/10`}>
                    <span className={`text-xs font-light tracking-[0.2em] uppercase ${JOB_META[profile.job].color}`}>
                      {JOB_META[profile.job].label}
                    </span>
                  </div>
                  <div
                    className={`flex items-center border px-3 py-1.5 ${PLAYSTYLE_META[profile.playstyle].bg} border-current/10`}>
                    <span
                      className={`text-xs font-light tracking-[0.2em] uppercase ${PLAYSTYLE_META[profile.playstyle].color}`}>
                      {PLAYSTYLE_META[profile.playstyle].label}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <p className="mb-3 text-xs font-light tracking-[0.25em] text-white/60 uppercase">About</p>
                    <p className="text-sm leading-relaxed font-light text-white/60">{profile.bio}</p>
                  </div>
                )}

                {/* Activities */}
                {profile.activities.length > 0 && (
                  <div>
                    <p className="mb-3 text-xs font-light tracking-[0.25em] text-white/60 uppercase">Activities</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.activities.map((act) => (
                        <span
                          key={act}
                          className="border border-red-900/25 bg-red-950/15 px-2.5 py-1 text-xs font-light tracking-wide text-white/60">
                          {ACTIVITY_LABEL[act]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm font-light text-white/60 italic">This member hasn't set up their profile yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
