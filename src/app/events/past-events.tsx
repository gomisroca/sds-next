// src/app/events/_components/past-events.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Loader2, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface PastEvent {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  startsAt: string; // ISO string from JSON
  endsAt: string | null;
  _count: { attendances: number };
}

interface PastEventsResponse {
  events: PastEvent[];
  nextCursor: string | null;
  hasMore: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Compact past event row ────────────────────────────────────────────────────
function PastEventRow({ event, index }: { event: PastEvent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 20) * 0.04, ease: [0.16, 1, 0.3, 1] }}>
      <Link href={`/events/${event.id}`} className="group block">
        <div className="relative flex items-stretch gap-0 border-b border-red-900/10 transition-colors duration-200 hover:border-red-900/20">
          <div className="absolute inset-0 bg-red-950/0 transition-colors duration-300 group-hover:bg-red-950/10" />

          {/* Date column */}
          <div className="relative z-10 flex w-24 shrink-0 flex-col items-center justify-center border-r border-red-900/10 py-4 text-center transition-colors group-hover:border-red-900/20 md:w-32">
            <span className="text-[10px] font-light tracking-[0.2em] text-red-900/40 uppercase">
              {new Date(event.startsAt).toLocaleDateString('en-GB', { weekday: 'short' })}
            </span>
            <span className="text-xl font-extralight text-white/30 tabular-nums">
              {new Date(event.startsAt).getDate()}
            </span>
            <span className="text-[10px] font-light text-white/20">
              {new Date(event.startsAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center gap-1 px-5 py-4">
            <h3 className="text-sm font-light tracking-wide text-white/45 transition-colors group-hover:text-white/65">
              {event.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs font-light text-white/20">
              <span>{formatTime(event.startsAt)}</span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5" strokeWidth={1.5} />
                  {event.location}
                </span>
              )}
            </div>
          </div>

          {/* Attendance */}
          <div className="relative z-10 flex shrink-0 items-center px-5 py-4">
            <span className="flex items-center gap-1.5 text-xs font-light text-white/15">
              <Users className="h-3 w-3" strokeWidth={1.5} />
              {event._count.attendances}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Past events section ───────────────────────────────────────────────────────
export default function PastEvents({ upcomingIds = [] }: { upcomingIds?: string[] }) {
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const fetchedRef = useRef(false);

  async function loadMore(currentCursor: string | null = null) {
    setLoading(true);
    try {
      const url = new URL('/api/events', window.location.origin);
      url.searchParams.set('past', 'true');
      url.searchParams.set('limit', '20');
      if (currentCursor) url.searchParams.set('cursor', currentCursor);

      const res = await fetch(url.toString());
      const data = (await res.json()) as PastEventsResponse;

      const filtered = data.events.filter((e) => !upcomingIds.includes(e.id));
      setEvents((prev) => [...prev, ...filtered]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load past events', err);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void loadMore();
  }, []);

  if (initialLoaded && events.length === 0) return null;

  const groups = events.reduce<Record<string, PastEvent[]>>((acc, event) => {
    const key = new Date(event.startsAt).toLocaleString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
    (acc[key] ??= []).push(event);
    return acc;
  }, {});

  return (
    <section className="mt-16">
      {/* Section header */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-xs font-light tracking-[0.3em] text-white/20 uppercase">Past Events</span>
        <div className="h-px flex-1 bg-red-900/10" />
      </div>

      {/* Initial loading skeleton */}
      {!initialLoaded && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-red-900/30" strokeWidth={1.5} />
        </div>
      )}

      {/* Event rows grouped by month */}
      <div className="flex flex-col gap-10">
        {Object.entries(groups).map(([month, monthEvents]) => (
          <div key={month}>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-[10px] font-light tracking-[0.3em] text-white/15 uppercase">{month}</span>
              <div className="h-px flex-1 bg-red-900/10" />
            </div>
            <div className="flex flex-col">
              {monthEvents.map((event, i) => (
                <PastEventRow key={event.id} event={event} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load more */}
      {initialLoaded && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => loadMore(cursor)}
            disabled={loading}
            className="flex items-center gap-2 border border-red-900/20 bg-white/[0.02] px-8 py-2.5 text-xs font-light tracking-[0.25em] text-white/25 uppercase transition-all hover:border-red-900/35 hover:text-white/45 disabled:opacity-50">
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
            ) : (
              <Calendar className="h-3 w-3" strokeWidth={1.5} />
            )}
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {initialLoaded && !hasMore && events.length > 0 && (
        <p className="mt-8 text-center text-xs font-light text-white/15">That's all of them.</p>
      )}
    </section>
  );
}
