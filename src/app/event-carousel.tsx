'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';

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

// ── Empty state ───────────────────────────────────────────────────────────────
function NoEventsCard() {
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
        <p className="mt-2 text-xs font-light text-white/15">Check back soon — we post new events regularly.</p>
      </div>
    </motion.div>
  );
}

// ── Single event slide ────────────────────────────────────────────────────────
function EventSlide({ event, direction }: { event: FeaturedEvent; direction: number }) {
  const date = formatEventDate(event.startsAt!);
  const time = formatEventTime(event.startsAt!);
  const endTime = event.endsAt ? formatEventTime(event.endsAt) : null;

  return (
    <motion.div
      key={event.id}
      custom={direction}
      variants={{
        enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
        centre: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
      }}
      initial="enter"
      animate="centre"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full">
      <Link href={`/events/${event.id}`} className="group flex flex-col md:flex-row">
        {/* Image */}
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

        {/* Content */}
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
            <h3 className="mb-2 text-2xl font-light tracking-wide text-white/90 transition-colors group-hover:text-white md:text-3xl">
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
            <span className="text-xs font-light tracking-[0.2em] text-red-700/50 uppercase transition-colors group-hover:text-red-600/70">
              View event →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Carousel ──────────────────────────────────────────────────────────────────
const AUTOPLAY_MS = 5000;

export default function EventCarousel({ events }: { events: FeaturedEvent[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const total = events.length;

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setIndex(next);
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % total);
    setDirection(1);
  }, [total]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + total) % total);
    setDirection(-1);
  }, [total]);

  // Autoplay — only when multiple events and not paused
  useEffect(() => {
    if (total <= 1 || paused) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % total);
      setDirection(1);
    }, AUTOPLAY_MS);

    return () => clearInterval(id);
  }, [total, paused]);

  if (total === 0) return <NoEventsCard />;

  const event = events[index]!;

  return (
    <motion.div
      className="group/carousel relative mb-8 overflow-hidden border border-red-900/30 bg-white/[0.03] backdrop-blur-sm"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      {/* Corner accents */}
      <div className="absolute top-0 left-0 z-10 h-6 w-6 border-t border-l border-red-600/50" />
      <div className="absolute top-0 right-0 z-10 h-6 w-6 border-t border-r border-red-600/50" />
      <div className="absolute bottom-0 left-0 z-10 h-6 w-6 border-b border-l border-red-600/50" />
      <div className="absolute right-0 bottom-0 z-10 h-6 w-6 border-r border-b border-red-600/50" />

      {/* Slide */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <EventSlide key={event.id} event={event} direction={direction} />
        </AnimatePresence>
      </div>

      {/* Navigation — only rendered when more than one event */}
      {total > 1 && (
        <div className="flex items-center justify-between border-t border-red-900/15 px-5 py-3">
          {/* Prev / next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              className="flex h-7 w-7 items-center justify-center border border-red-900/20 text-white/25 transition-colors hover:border-red-800/40 hover:text-white/55">
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={next}
              className="flex h-7 w-7 items-center justify-center border border-red-900/20 text-white/25 transition-colors hover:border-red-800/40 hover:text-white/55">
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {events.map((e, i) => (
              <button
                key={e.id}
                type="button"
                onClick={() => go(i, i > index ? 1 : -1)}
                className="transition-all duration-200"
                aria-label={`Go to event ${i + 1}`}>
                <span
                  className={`block rounded-full transition-all duration-200 ${
                    i === index ? 'h-1.5 w-4 bg-red-700/70' : 'h-1.5 w-1.5 bg-red-900/30 hover:bg-red-800/50'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Counter */}
          <span className="text-[10px] font-light tracking-[0.2em] text-white/20 uppercase">
            {index + 1} / {total}
          </span>
        </div>
      )}

      {/* Autoplay progress bar */}
      {total > 1 && !paused && (
        <motion.div
          key={`${index}-progress`}
          className="absolute bottom-0 left-0 h-px bg-red-700/40"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
          style={{ transformOrigin: 'left', width: '100%' }}
        />
      )}
    </motion.div>
  );
}
