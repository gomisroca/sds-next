'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

import OrnamentalRule from './components/ui/ornamental-rule';

export interface FeaturedEvent {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  _count: { attendances: number };
}

function formatEventDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatEventTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function NoEventCard() {
  return (
    <motion.div
      className="mb-8 flex items-center justify-center border border-red-900/20 bg-white/[0.02] p-10 text-center"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}>
      <div>
        <Calendar className="mx-auto mb-4 h-8 w-8 text-red-900/30" strokeWidth={1} />
        <p className="text-sm font-light tracking-widest text-white/25 uppercase">No upcoming events</p>
        <p className="mt-2 text-xs font-light text-white/15">Check back soon - we post new events regularly.</p>
      </div>
    </motion.div>
  );
}

export function FeaturedEventCard({ event }: { event: FeaturedEvent | null }) {
  if (!event) return <NoEventCard />;

  const date = formatEventDate(event.startsAt!);
  const time = formatEventTime(event.startsAt!);
  const endTime = event.endsAt ? formatEventTime(event.endsAt) : null;

  return (
    <motion.div
      className="group relative mb-8 overflow-hidden rounded-sm border border-red-900/30 bg-white/[0.03] backdrop-blur-sm"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}>
      <div className="absolute top-0 left-0 z-10 h-6 w-6 border-t border-l border-red-600/50" />
      <div className="absolute top-0 right-0 z-10 h-6 w-6 border-t border-r border-red-600/50" />
      <div className="absolute bottom-0 left-0 z-10 h-6 w-6 border-b border-l border-red-600/50" />
      <div className="absolute right-0 bottom-0 z-10 h-6 w-6 border-r border-b border-red-600/50" />

      <Link href={`/events/${event.id}`} className="flex flex-col md:flex-row">
        {event.imageUrl && (
          <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-2/5">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-transparent via-transparent to-black/70 md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center gap-4 p-7 md:p-10">
          <div className="flex items-center gap-3">
            <motion.span
              className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span className="text-xs font-light tracking-[0.3em] text-red-400/80 uppercase">Upcoming Event</span>
          </div>

          <div>
            <h3 className="mb-2 text-2xl font-light tracking-wide text-white/90 transition-colors duration-200 group-hover:text-white md:text-3xl">
              {event.name}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs font-light text-white/30">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                {date}
              </span>
              <span>
                {time}
                {endTime ? ` – ${endTime}` : ''}
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" strokeWidth={1.5} />
                  {event.location}
                </span>
              )}
            </div>
          </div>

          <OrnamentalRule className="max-w-xs" />

          {event.description && (
            <p className="line-clamp-2 text-sm leading-relaxed font-light text-white/50">{event.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-light text-white/25">
              <Users className="h-3 w-3" strokeWidth={1.5} />
              {event._count.attendances} attending
            </span>
            <span className="text-xs font-light tracking-[0.2em] text-red-700/50 uppercase transition-colors duration-200 group-hover:text-red-600/70">
              View event →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
