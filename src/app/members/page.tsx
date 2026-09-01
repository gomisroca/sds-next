import { PageHeader } from '@/app/components/ui/page-header';
import { PageShell } from '@/app/components/ui/page-shell';
import MemberCard from '@/app/members/member-card';
import { db } from '@/server/db';

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
          slug: true,
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
    <PageShell>
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <PageHeader
          title="Members"
          subtitle={`${members.length} adventurer${members.length !== 1 ? 's' : ''} call the Den home.`}
        />

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
            <p className="text-sm font-light tracking-widest text-white/60 uppercase">No members yet.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="text-xs font-light tracking-[0.3em] text-red-600/80 uppercase">{label}</span>
      <div className="h-px flex-1 bg-red-900/20" />
    </div>
  );
}
