'use client';

import { motion } from 'framer-motion';
import type { AttendanceStatus } from 'generated/prisma';
import { useOptimistic, useTransition } from 'react';

const BUTTONS = [
  {
    status: 'ATTENDING' as AttendanceStatus,
    label: 'Attending',
    emoji: '✅',
    activeClass: 'border-emerald-700/60 bg-emerald-950/30 text-emerald-400/90',
    hoverClass: 'hover:border-emerald-800/40 hover:text-emerald-500/70',
  },
  {
    status: 'MAYBE' as AttendanceStatus,
    label: 'Maybe',
    emoji: '❓',
    activeClass: 'border-yellow-700/60 bg-yellow-950/30 text-yellow-400/90',
    hoverClass: 'hover:border-yellow-800/40 hover:text-yellow-500/70',
  },
  {
    status: 'NOT_ATTENDING' as AttendanceStatus,
    label: 'Not Attending',
    emoji: '❌',
    activeClass: 'border-red-700/60 bg-red-950/30 text-red-400/90',
    hoverClass: 'hover:border-red-900/40 hover:text-red-500/70',
  },
] as const;

interface RSVPButtonsProps {
  eventId: string;
  confirmedStatus: AttendanceStatus | null;
  onSuccess: (next: AttendanceStatus) => void;
}

export function RSVPButtons({ eventId, confirmedStatus, onSuccess }: RSVPButtonsProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(confirmedStatus);
  const [isPending, startTransition] = useTransition();

  async function handleRSVP(status: AttendanceStatus) {
    if (status === optimisticStatus) return;

    startTransition(async () => {
      // Show the new selection immediately
      setOptimisticStatus(status);

      try {
        const res = await fetch(`/api/events/${eventId}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (res.ok) {
          onSuccess(status);
        } else {
          console.error('RSVP failed', await res.json());
        }
      } catch (err) {
        console.error('RSVP error', err);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-light tracking-[0.25em] text-white/30 uppercase">Your RSVP</p>

      <div className="flex flex-col gap-2">
        {BUTTONS.map(({ status, label, emoji, activeClass, hoverClass }, i) => {
          const isActive = optimisticStatus === status;

          return (
            <motion.button
              key={status}
              onClick={() => handleRSVP(status)}
              disabled={isPending}
              className={`flex items-center gap-3 border px-4 py-2.5 text-xs font-light tracking-[0.2em] uppercase transition-all duration-200 disabled:opacity-50 ${
                isActive ? activeClass : `cursor-pointer border-red-900/20 bg-white/[0.02] text-white/30 ${hoverClass}`
              }`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              <span>{emoji}</span>
              <span>{label}</span>
              {isActive && (
                <motion.span
                  className="ml-auto text-[10px] tracking-widest opacity-60"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}>
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {optimisticStatus && (
        <motion.p
          className="text-[10px] font-light tracking-widest text-white/20 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          You can change your mind any time.
        </motion.p>
      )}
    </div>
  );
}
