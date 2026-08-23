'use client';

import type { AttendanceStatus } from 'generated/prisma';
import { useState } from 'react';

import { DiscordAccessButton } from '@/app/components/auth/discord-access-button';
import { AttendanceCounts as AttendanceCountsDisplay } from '@/app/events/[slug]/attendance-counts';
import { RSVPButtons } from '@/app/events/[slug]/rsvp-buttons';
import type { AttendanceCounts } from '@/utils/events';

interface EventDetailClientProps {
  eventSlug: string;
  startsAt: Date;
  initialAttendance: AttendanceCounts;
  initialStatus: AttendanceStatus | null;
  isAuthenticated: boolean;
}

function deriveNextCounts(
  current: AttendanceCounts,
  prev: AttendanceStatus | null,
  next: AttendanceStatus
): AttendanceCounts {
  const delta: Partial<Record<AttendanceStatus, number>> = {};
  if (prev) delta[prev] = -1;
  delta[next] = (delta[next] ?? 0) + 1;
  return {
    ...current,
    attending: current.attending + (delta.ATTENDING ?? 0),
    maybe: current.maybe + (delta.MAYBE ?? 0),
    notAttending: current.notAttending + (delta.NOT_ATTENDING ?? 0),
  };
}

export function EventDetailClient({
  eventSlug,
  startsAt,
  initialAttendance,
  initialStatus,
  isAuthenticated,
}: EventDetailClientProps) {
  const [confirmedStatus, setConfirmedStatus] = useState<AttendanceStatus | null>(initialStatus);
  const [attendance, setAttendance] = useState<AttendanceCounts>(initialAttendance);

  function handleSuccess(next: AttendanceStatus) {
    setAttendance((current) => deriveNextCounts(current, confirmedStatus, next));
    setConfirmedStatus(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <AttendanceCountsDisplay attendance={attendance} />
      {startsAt.getTime() > Date.now() &&
        (isAuthenticated ? (
          <RSVPButtons eventSlug={eventSlug} confirmedStatus={confirmedStatus} onSuccess={handleSuccess} />
        ) : (
          <SignInPrompt />
        ))}
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex flex-col gap-3 border border-red-900/20 bg-white/[0.02] p-5">
      <p className="text-xs font-light tracking-[0.25em] text-white/60 uppercase">Your RSVP</p>
      <p className="text-sm font-light text-white/60">Sign in with Discord to let us know if you're coming.</p>
      <DiscordAccessButton className="mx-auto flex cursor-pointer items-center gap-2 border border-red-800/50 bg-red-950/20 px-2 py-1.5 text-xs font-light tracking-[0.25em] text-red-400 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300" />
    </div>
  );
}
