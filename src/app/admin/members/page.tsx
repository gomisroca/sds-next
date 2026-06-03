import { UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { ROLE_META } from '@/utils/profile';

import RoleSelector from './role-selector';

export const dynamic = 'force-dynamic';

async function getMembers() {
  return db.user.findMany({
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      profile: { select: { id: true, name: true } },
      accounts: {
        where: { provider: 'discord' },
        select: { providerAccountId: true },
      },
    },
  });
}

// Group label + colour for section dividers
const ROLE_ORDER = ['LEADER', 'OFFICER', 'MEMBER', 'GUEST'] as const;

export default async function AdminMembersPage() {
  const [session, members] = await Promise.all([auth(), getMembers()]);
  const isLeader = session?.user?.role === 'LEADER';
  const currentUserId = session?.user?.id;

  // Group by role in display order
  const grouped = ROLE_ORDER.map((role) => ({
    role,
    members: members.filter((m) => m.role === role),
  })).filter((g) => g.members.length > 0);

  return (
    <>
      <div className="mb-10">
        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Members</h1>
        <OrnamentalRule className="max-w-xs" />
        <p className="mt-6 text-sm font-light text-white/35">
          {members.length} user{members.length !== 1 ? 's' : ''} total.
          {isLeader ? ' Use the role selector to promote or demote members.' : ' Only leaders can change roles.'}
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {grouped.map(({ role, members: group }) => (
          <section key={role}>
            {/* Section header */}
            <div className="mb-4 flex items-center gap-4">
              <span className={`text-[10px] font-light tracking-[0.3em] uppercase ${ROLE_META[role].color}`}>
                {ROLE_META[role].label}s ({group.length})
              </span>
              <div className="h-px flex-1 bg-red-900/15" />
            </div>

            {/* Member rows */}
            <div className="flex flex-col gap-2">
              {group.map((member) => {
                const hasDiscord = member.accounts.length > 0;
                const hasProfile = !!member.profile;
                const isSelf = member.id === currentUserId;
                // Leaders can edit everyone except themselves
                const canEditRole = isLeader && !isSelf;

                return (
                  <div
                    key={member.id}
                    className="relative flex items-center gap-4 border border-red-900/15 bg-white/[0.02] px-5 py-4 transition-colors hover:border-red-900/25">
                    {/* Corner accent */}
                    <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-red-900/20" />

                    {/* Avatar */}
                    <div className="shrink-0">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name ?? 'Avatar'}
                          width={36}
                          height={36}
                          className="rounded-full ring-1 ring-red-900/30"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-950/40 text-sm font-light text-red-900/60 ring-1 ring-red-900/20">
                          {member.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                    </div>

                    {/* Identity */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-light text-white/75">{member.name ?? 'Unknown'}</p>
                        {isSelf && (
                          <span className="text-[10px] font-light tracking-widest text-white/20 uppercase">You</span>
                        )}
                      </div>
                      {member.email && <p className="truncate text-xs font-light text-white/25">{member.email}</p>}
                      <p className="mt-0.5 text-[10px] font-light text-white/15">
                        Joined{' '}
                        {member.createdAt.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Status indicators */}
                    <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                      <StatusPill
                        label="Discord"
                        active={hasDiscord}
                        activeColor="text-indigo-400/70"
                        inactiveLabel="Not linked"
                      />
                      <StatusPill
                        label="Profile"
                        active={hasProfile}
                        activeColor="text-emerald-400/70"
                        inactiveLabel="No profile"
                      />
                    </div>

                    {/* Profile shortcut */}
                    {!hasProfile && member.role !== 'GUEST' && (
                      <Link
                        href={`/profile/new?userId=${member.id}`}
                        className="hidden shrink-0 items-center gap-1.5 border border-red-900/20 px-3 py-1.5 text-[10px] font-light tracking-[0.2em] text-white/25 uppercase transition-all hover:border-red-800/35 hover:text-white/50 sm:flex">
                        <UserPlus className="h-3 w-3" strokeWidth={1.5} />
                        Profile
                      </Link>
                    )}
                    {hasProfile && (
                      <Link
                        href={`/members/${member.id}`}
                        className="hidden shrink-0 items-center gap-1.5 border border-red-900/20 px-3 py-1.5 text-[10px] font-light tracking-[0.2em] text-white/25 uppercase transition-all hover:border-red-800/35 hover:text-white/50 sm:flex">
                        View
                      </Link>
                    )}

                    {/* Role selector */}
                    <div className="shrink-0">
                      <RoleSelector userId={member.id} currentRole={member.role} canEdit={canEditRole} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function StatusPill({
  label,
  active,
  activeColor,
  inactiveLabel,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  inactiveLabel: string;
}) {
  return (
    <span className={`text-[10px] font-light tracking-widest uppercase ${active ? activeColor : 'text-white/15'}`}>
      {active ? `✓ ${label}` : inactiveLabel}
    </span>
  );
}
