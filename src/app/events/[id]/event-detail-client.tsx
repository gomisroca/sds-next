'use client';

import type { AttendanceStatus } from 'generated/prisma';
import Link from 'next/link';
import { useState } from 'react';

import { AttendanceCounts as AttendanceCountsDisplay } from '@/app/events/[id]/attendance-counts';
import { RSVPButtons } from '@/app/events/[id]/rsvp-buttons';
import type { AttendanceCounts } from '@/utils/events';

interface EventDetailClientProps {
  eventId: string;
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
  eventId,
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
          <RSVPButtons eventId={eventId} confirmedStatus={confirmedStatus} onSuccess={handleSuccess} />
        ) : (
          <SignInPrompt />
        ))}
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="flex flex-col gap-3 border border-red-900/20 bg-white/[0.02] p-5">
      <p className="text-xs font-light tracking-[0.25em] text-white/30 uppercase">Your RSVP</p>
      <p className="text-sm font-light text-white/35">Sign in with Discord to let us know if you're coming.</p>
      <Link
        href="/api/auth/signin"
        className="inline-block border border-red-800/50 bg-red-950/20 px-6 py-2 text-xs font-light tracking-[0.25em] text-red-400/85 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300">
        Sign in with Discord
      </Link>
    </div>
  );
}
