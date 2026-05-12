'use client';

import { motion } from 'framer-motion';

import type { AttendanceCounts as AttendanceCountsType } from '@/utils/events';

const STATUSES = [
  { key: 'attending', label: 'Attending', emoji: '✅', color: 'text-emerald-500/70' },
  { key: 'maybe', label: 'Maybe', emoji: '❓', color: 'text-yellow-600/70' },
  { key: 'notAttending', label: 'Not Attending', emoji: '❌', color: 'text-red-700/60' },
] as const;

export default function AttendanceCounts({ attendance }: { attendance: AttendanceCountsType }) {
  const total = attendance.attending + attendance.maybe + attendance.notAttending;

  return (
    <div className="flex flex-col gap-3 border border-red-900/20 bg-white/[0.02] p-5">
      <p className="text-xs font-light tracking-[0.25em] text-white/30 uppercase">Attendance</p>

      {STATUSES.map(({ key, label, emoji, color }, i) => {
        const count = attendance[key];
        const pct = total > 0 ? (count / total) * 100 : 0;

        return (
          <motion.div
            key={key}
            className="flex flex-col gap-1.5"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-light ${color}`}>
                {emoji} {label}
              </span>
              <span className="text-xs font-light text-white/40 tabular-nums">{count}</span>
            </div>
            {/* Mini progress bar */}
            <div className="h-px w-full bg-red-900/15">
              <motion.div
                className="h-full bg-red-800/40"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: pct / 100 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </motion.div>
        );
      })}

      {total === 0 && <p className="text-xs font-light text-white/20 italic">No responses yet.</p>}
    </div>
  );
}
