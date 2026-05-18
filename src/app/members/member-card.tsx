'use client';

import { motion } from 'framer-motion';
import type { Activity, Job, Playstyle, Role } from 'generated/prisma';
import Link from 'next/link';

import { ACTIVITY_LABEL, JOB_META, PLAYSTYLE_META, ROLE_META } from '@/utils/profile';

interface MemberCardProps {
  member: {
    id: string;
    name: string | null;
    image: string | null;
    role: Role;
    profile: {
      name: string;
      bio: string | null;
      portrait: string | null;
      job: Job;
      activities: Activity[];
      playstyle: Playstyle;
    } | null;
  };
  index: number;
}

// Show at most this many activity tags before truncating
const MAX_ACTIVITIES = 4;

export default function MemberCard({ member, index }: MemberCardProps) {
  const profile = member.profile;
  const displayName = profile?.name ?? member.name ?? 'Unknown';
  const portrait = profile?.portrait ?? member.image;
  const roleMeta = ROLE_META[member.role];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: (index % 6) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}>
      <Link href={`/members/${member.id}`} className="group block h-full">
        <div className="relative flex h-full flex-col overflow-hidden border border-red-900/20 bg-white/[0.02] transition-all duration-300 hover:border-red-800/40 hover:bg-white/[0.04]">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 z-10 h-5 w-5 border-t border-l border-red-700/35 transition-colors duration-300 group-hover:border-red-600/50" />
          <div className="absolute top-0 right-0 z-10 h-5 w-5 border-t border-r border-red-700/35 transition-colors duration-300 group-hover:border-red-600/50" />

          {/* Portrait */}
          <div className="relative h-52 w-full overflow-hidden bg-red-950/20">
            {portrait ? (
              <img
                src={portrait}
                alt={displayName}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-5xl font-extralight text-red-900/40">{displayName[0]?.toUpperCase()}</span>
              </div>
            )}
            {/* Bottom fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#060404] via-[#060404]/30 to-transparent" />

            {/* Role badge - overlaid on portrait */}
            {member.role !== 'MEMBER' && (
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-light tracking-[0.2em] uppercase ${roleMeta.color}`}>
                  {roleMeta.label}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-3 p-5">
            {/* Name */}
            <div>
              <h3 className="text-base font-light tracking-wide text-white/85 transition-colors duration-200 group-hover:text-white">
                {displayName}
              </h3>
            </div>

            {profile ? (
              <>
                {/* Job + playstyle */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Job badge */}
                  <span
                    className={`border px-2 py-0.5 text-[10px] font-light tracking-[0.2em] uppercase ${JOB_META[profile.job].color} border-current/20 ${JOB_META[profile.job].bg}`}>
                    {JOB_META[profile.job].label}
                  </span>
                  {/* Job role */}
                  <span className="text-[10px] font-light tracking-widest text-white/25 uppercase">
                    {JOB_META[profile.job].role}
                  </span>
                  {/* Separator */}
                  <span className="text-white/15">·</span>
                  {/* Playstyle */}
                  <span
                    className={`text-[10px] font-light tracking-widest uppercase ${PLAYSTYLE_META[profile.playstyle].color}`}>
                    {PLAYSTYLE_META[profile.playstyle].label}
                  </span>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="line-clamp-2 text-xs leading-relaxed font-light text-white/40">{profile.bio}</p>
                )}

                {/* Activities */}
                {profile.activities.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {profile.activities.slice(0, MAX_ACTIVITIES).map((act) => (
                      <span
                        key={act}
                        className="border border-red-900/25 bg-red-950/15 px-1.5 py-0.5 text-[10px] font-light tracking-wide text-white/30">
                        {ACTIVITY_LABEL[act]}
                      </span>
                    ))}
                    {profile.activities.length > MAX_ACTIVITIES && (
                      <span className="px-1.5 py-0.5 text-[10px] font-light text-white/20">
                        +{profile.activities.length - MAX_ACTIVITIES}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs font-light text-white/20 italic">No profile yet.</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
