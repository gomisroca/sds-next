import { db } from '@/server/db';

import OrnamentalRule from '../components/ui/ornamental-rule';
import MemberCard from './member-card';

export const revalidate = 120;

async function getMembers() {
  return db.user.findMany({
    orderBy: [
      // Leaders first, then officers, then members
      { role: 'asc' },
      { name: 'asc' },
    ],
    where: { role: { in: ['LEADER', 'OFFICER', 'MEMBER'] } },
    select: {
      id: true,
      name: true,
      image: true,
      role: true,
      profile: {
        select: {
          name: true,
          bio: true,
          portrait: true,
          job: true,
          activities: true,
          playstyle: true,
        },
      },
    },
  });
}

export default async function MembersPage() {
  const members = await getMembers();

  // Split into officers/leaders and regular members for section headers
  const leadership = members.filter((m) => m.role === 'LEADER' || m.role === 'OFFICER');
  const regulars = members.filter((m) => m.role === 'MEMBER');

  return (
    <main
      className="min-h-screen bg-[#060404] pt-14 text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      {/* Background */}
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

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/70 uppercase">Sleeping Dragons</p>
          <h1 className="mb-6 text-4xl font-extralight tracking-[0.1em] text-white/85 uppercase md:text-5xl">
            Members
          </h1>
          <OrnamentalRule className="max-w-xs" />
          <p className="mt-6 max-w-lg text-sm leading-relaxed font-light text-white/40">
            {members.length} adventurer{members.length !== 1 ? 's' : ''} call the Den home.
          </p>
        </div>

        {/* Leadership */}
        {leadership.length > 0 && (
          <div className="mb-14">
            <SectionLabel label="Leadership" />
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {leadership.map((m, i) => (
                <MemberCard key={m.id} member={m} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        {regulars.length > 0 && (
          <div>
            {leadership.length > 0 && <SectionLabel label="Members" />}
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {regulars.map((m, i) => (
                <MemberCard key={m.id} member={m} index={i} />
              ))}
            </div>
          </div>
        )}

        {members.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-sm font-light tracking-widest text-white/20 uppercase">No members yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="text-xs font-light tracking-[0.3em] text-red-700/60 uppercase">{label}</span>
      <div className="h-px flex-1 bg-red-900/20" />
    </div>
  );
}
