import { EventStatus } from 'generated/prisma';
import { Calendar } from 'lucide-react';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

import OrnamentalRule from '../components/ui/ornamental-rule';
import EventRow from './event-row';

export const dynamic = 'force-dynamic';

async function getEvents(userId?: string) {
  return db.event.findMany({
    where: {
      startsAt: { gte: new Date() },
      OR: [
        { status: EventStatus.PUBLISHED },
        // Show the current user's own drafts so they can preview before publishing
        ...(userId ? [{ status: EventStatus.DRAFT, createdById: userId }] : []),
      ],
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      imageUrl: true,
      startsAt: true,
      endsAt: true,
      status: true,
      createdById: true,
      createdBy: { select: { name: true } },
      _count: { select: { attendances: true } },
    },
  });
}

export default async function EventsPage() {
  const session = await auth();
  const events = await getEvents(session?.user?.id);

  return (
    <main
      className="min-h-screen bg-[#060404] pt-14 text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,50,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,50,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/70 uppercase">Sleeping Dragons</p>
          <h1 className="mb-6 text-4xl font-extralight tracking-[0.1em] text-white/85 uppercase md:text-5xl">Events</h1>
          <OrnamentalRule className="max-w-xs" />
          <p className="mt-6 max-w-lg text-sm leading-relaxed font-light text-white/40">
            Upcoming gatherings, raids, and social nights for the Free Company. All times shown in your local timezone.
          </p>
        </div>

        {/* Schedule */}
        {events.length === 0 ? <EmptyState /> : <EventSchedule events={events} />}
      </div>
    </main>
  );
}

type EventRow_Event = Awaited<ReturnType<typeof getEvents>>[number];

function EventSchedule({ events }: { events: EventRow_Event[] }) {
  const groups = events.reduce<Record<string, EventRow_Event[]>>((acc, event) => {
    const key = event.startsAt.toLocaleString('en-GB', {
      month: 'long',
      year: 'numeric',
    });
    (acc[key] ??= []).push(event);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-12">
      {Object.entries(groups).map(([month, monthEvents]) => (
        <section key={month}>
          {/* Month label */}
          <div className="mb-5 flex items-center gap-4">
            <span className="text-xs font-light tracking-[0.3em] text-red-700/60 uppercase">{month}</span>
            <div className="h-px flex-1 bg-red-900/20" />
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {monthEvents.map((event, i) => (
              <EventRow key={event.id} event={event} index={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Calendar className="h-8 w-8 text-red-900/40" strokeWidth={1} />
      <p className="text-sm font-light tracking-widest text-white/25 uppercase">No upcoming events</p>
      <p className="text-xs font-light text-white/20">Check back soon - we post new events regularly.</p>
    </div>
  );
}
