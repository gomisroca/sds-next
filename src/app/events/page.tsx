import { EventStatus } from 'generated/prisma';
import { Calendar, Pencil } from 'lucide-react';
import Link from 'next/link';

import { PageHeader } from '@/app/components/ui/page-header';
import { PageShell } from '@/app/components/ui/page-shell';
import EventRow from '@/app/events/event-row';
import PastEvents from '@/app/events/past-events';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

async function getEvents(userId?: string) {
  return db.event.findMany({
    where: {
      startsAt: { gte: new Date() },
      OR: [{ status: EventStatus.PUBLISHED }, ...(userId ? [{ status: EventStatus.DRAFT, createdById: userId }] : [])],
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
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
    <PageShell>
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <PageHeader
          title="Events"
          subtitle="Upcoming gatherings, raids, and social nights for the Free Company.  All times shown in your local
              timezone.">
          {session?.user?.id && session.user.role !== 'GUEST' && (
            <Link
              href={`/events/new`}
              className="mt-2 flex h-fit w-fit items-center gap-2 border border-red-900/25 bg-white/[0.02] px-4 py-1.5 text-xs font-light tracking-[0.2em] text-white/60 uppercase transition-all hover:border-red-800/40 hover:text-white/90">
              <Pencil className="h-3 w-3" strokeWidth={1.5} />
              Create Event
            </Link>
          )}
        </PageHeader>

        {/* Schedule */}
        {events.length === 0 ? <EmptyState /> : <EventSchedule events={events} />}

        {/* Past events */}
        <PastEvents upcomingIds={events.map((e) => e.id)} />
      </div>
    </PageShell>
  );
}

// ── Schedule grouped by month ─────────────────────────────────────────────────
type EventRow_Event = Awaited<ReturnType<typeof getEvents>>[number];

function EventSchedule({ events }: { events: EventRow_Event[] }) {
  const groups = events.reduce<Record<string, EventRow_Event[]>>((acc, event) => {
    const key = event.startsAt!.toLocaleString('en-GB', {
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
            <span className="text-xs font-light tracking-[0.3em] text-red-600/80 uppercase">{month}</span>
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
      <p className="text-sm font-light tracking-widest text-white/60 uppercase">No upcoming events</p>
      <p className="text-xs font-light text-white/60">Check back soon - we post new events regularly.</p>
    </div>
  );
}
