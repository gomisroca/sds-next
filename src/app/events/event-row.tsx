'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

import { formatEventDate, formatEventTime } from '@/utils/events';

interface EventRowProps {
  event: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    startsAt: Date | null;
    endsAt: Date | null;
    status: string;
    _count: { attendances: number };
  };
  index: number;
}

export default function EventRow({ event, index }: EventRowProps) {
  const time = formatEventTime(event.startsAt!);
  const endTime = event.endsAt ? formatEventTime(event.endsAt) : null;
  const [weekday, dayNumber] = formatEventDate(event.startsAt!).split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}>
      <Link href={`/events/${event.id}`} className="group block">
        <div className="relative flex items-stretch gap-0 border-b border-red-900/15 transition-colors duration-200 hover:border-red-800/30">
          {/* Hover background */}
          <div className="absolute inset-0 bg-red-950/0 transition-colors duration-300 group-hover:bg-red-950/15" />

          {/* Date column */}
          <div className="relative z-10 flex w-24 shrink-0 flex-col items-center justify-center border-r border-red-900/15 py-5 text-center transition-colors duration-200 group-hover:border-red-800/30 md:w-32">
            <span className="text-[10px] font-light tracking-[0.25em] text-red-600/80 uppercase">{weekday}</span>
            <span className="text-2xl font-extralight text-white/80 tabular-nums">{dayNumber}</span>
          </div>

          {/* Time column */}
          <div className="relative z-10 hidden w-28 shrink-0 flex-col items-center justify-center gap-1 border-r border-red-900/15 py-5 text-center transition-colors duration-200 group-hover:border-red-800/30 md:flex">
            <Clock className="h-3.5 w-3.5 shrink-0 text-red-600/80" strokeWidth={1.5} />
            <p className="text-sm font-light text-white/90">
              {formatEventTime(event.startsAt!)}
              {event.endsAt ? ` - ${formatEventTime(event.endsAt)}` : ''}
            </p>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center gap-1.5 px-5 py-5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-light tracking-wide text-white/80 transition-colors duration-200 group-hover:text-white/90 md:text-lg">
                {event.name}
              </h3>
              {event.status === 'DRAFT' && (
                <span className="shrink-0 border border-yellow-900/50 bg-yellow-950/30 px-1.5 py-0.5 text-[10px] font-light tracking-widest text-yellow-600/70 uppercase">
                  Draft
                </span>
              )}
            </div>
            {event.description && <p className="line-clamp-1 text-xs font-light text-white/60">{event.description}</p>}
            {/* Mobile time */}
            <p className="text-xs font-light text-white/60 tabular-nums md:hidden">
              {time}
              {endTime ? ` → ${endTime}` : ''}
            </p>
          </div>

          {/* Meta column */}
          <div className="relative z-10 flex shrink-0 flex-col items-end justify-center gap-2 px-5 py-5 text-right">
            {event.location && (
              <span className="flex items-center gap-1.5 text-xs font-light text-white/60">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                <span className="hidden sm:inline">{event.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs font-light text-white/60">
              <Users className="h-3 w-3" strokeWidth={1.5} />
              {event._count.attendances}
            </span>
          </div>

          {/* Right arrow hint */}
          <div className="relative z-10 flex items-center pr-4 text-red-800/0 transition-colors duration-200 group-hover:text-red-600/80">
            <span className="text-sm">›</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
