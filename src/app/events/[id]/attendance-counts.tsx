'use client';

import { motion } from 'framer-motion';

import type { AttendanceCounts as AttendanceCountsType } from '@/utils/events';

const STATUSES = [
  { key: 'attending' as const, label: 'Attending', emoji: '✅', barClass: 'bg-emerald-800/40' },
  { key: 'maybe' as const, label: 'Maybe', emoji: '❓', barClass: 'bg-yellow-800/40' },
  { key: 'notAttending' as const, label: 'Not Attending', emoji: '❌', barClass: 'bg-red-800/40' },
];

export function AttendanceCounts({ attendance }: { attendance: AttendanceCountsType }) {
  const total = attendance.attending + attendance.maybe + attendance.notAttending;

  return (
    <div className="flex flex-col gap-3 border border-red-900/20 bg-white/[0.02] p-5">
      <p className="text-xs font-light tracking-[0.25em] text-white/30 uppercase">Attendance</p>

      {STATUSES.map(({ key, label, emoji, barClass }, _) => {
        const count = attendance[key];
        const pct = total > 0 ? count / total : 0;

        return (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-light text-white/40">
                {emoji} {label}
              </span>
              <motion.span
                className="text-xs font-light text-white/40 tabular-nums"
                key={count}
                initial={{ opacity: 0.4, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}>
                {count}
              </motion.span>
            </div>
            <div className="h-px w-full bg-red-900/15">
              <motion.div
                className={`h-full ${barClass}`}
                animate={{ scaleX: pct }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </div>
        );
      })}

      {total === 0 && <p className="text-xs font-light text-white/20 italic">No responses yet.</p>}
    </div>
  );
}
