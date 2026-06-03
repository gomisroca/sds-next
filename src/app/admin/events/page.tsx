import { EventStatus } from 'generated/prisma';
import { Calendar, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

async function getEvents() {
  return db.event.findMany({
    where: { isTemplate: false },
    orderBy: { startsAt: 'desc' },
    select: {
      id: true,
      name: true,
      status: true,
      startsAt: true,
      endsAt: true,
      location: true,
      createdAt: true,
      createdBy: { select: { name: true } },
      _count: { select: { attendances: true } },
    },
  });
}

const STATUS_STYLES: Record<EventStatus, { label: string; color: string; bg: string }> = {
  DRAFT: { label: 'Draft', color: 'text-yellow-600/70', bg: 'bg-yellow-950/20 border-yellow-900/30' },
  PUBLISHED: { label: 'Published', color: 'text-emerald-500/70', bg: 'bg-emerald-950/20 border-emerald-900/30' },
  CANCELLED: { label: 'Cancelled', color: 'text-white/25', bg: 'bg-white/[0.02] border-red-900/15' },
  COMPLETED: { label: 'Completed', color: 'text-white/25', bg: 'bg-white/[0.02] border-red-900/15' },
};

const STATUS_ORDER: EventStatus[] = ['PUBLISHED', 'DRAFT', 'CANCELLED', 'COMPLETED'];

function formatDate(date: Date | null) {
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    events: events.filter((e) => e.status === status),
  })).filter((g) => g.events.length > 0);

  return (
    <>
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin</p>
          <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Events</h1>
          <OrnamentalRule className="max-w-xs" />
          <p className="mt-6 text-sm font-light text-white/35">
            {events.length} event{events.length !== 1 ? 's' : ''} total.
          </p>
        </div>

        <Link
          href="/events/new"
          className="mt-1 flex shrink-0 items-center gap-2 border border-red-800/50 bg-red-950/20 px-5 py-2 text-xs font-light tracking-[0.2em] text-red-400/85 uppercase transition-all hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300">
          <Plus className="h-3 w-3" strokeWidth={2} />
          New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <Calendar className="h-8 w-8 text-red-900/30" strokeWidth={1} />
          <p className="text-sm font-light tracking-widest text-white/20 uppercase">No events yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {grouped.map(({ status, events: group }) => {
            const style = STATUS_STYLES[status];
            return (
              <section key={status}>
                <div className="mb-4 flex items-center gap-4">
                  <span className={`text-[10px] font-light tracking-[0.3em] uppercase ${style.color}`}>
                    {style.label} ({group.length})
                  </span>
                  <div className="h-px flex-1 bg-red-900/15" />
                </div>

                <div className="flex flex-col gap-2">
                  {group.map((event) => (
                    <div
                      key={event.id}
                      className="group relative flex items-center gap-4 border border-red-900/15 bg-white/[0.02] px-5 py-4 transition-colors hover:border-red-900/25">
                      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-red-900/20" />

                      {/* Status pill */}
                      <span
                        className={`shrink-0 border px-2 py-0.5 text-[10px] font-light tracking-widest uppercase ${style.color} ${style.bg}`}>
                        {style.label}
                      </span>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-light text-white/75">{event.name}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs font-light text-white/25">
                          <span>{formatDate(event.startsAt)}</span>
                          {event.location && <span>{event.location}</span>}
                          {event.createdBy.name && <span>by {event.createdBy.name}</span>}
                        </div>
                      </div>

                      {/* Attendance count */}
                      <span className="shrink-0 text-xs font-light text-white/20">
                        {event._count.attendances} RSVP{event._count.attendances !== 1 ? 's' : ''}
                      </span>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          href={`/events/${event.id}`}
                          className="border border-red-900/20 px-3 py-1.5 text-[10px] font-light tracking-[0.2em] text-white/25 uppercase transition-all hover:border-red-800/35 hover:text-white/50">
                          View
                        </Link>
                        {event.status === EventStatus.DRAFT && (
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="flex items-center gap-1.5 border border-red-900/20 px-3 py-1.5 text-[10px] font-light tracking-[0.2em] text-white/25 uppercase transition-all hover:border-red-800/35 hover:text-white/50">
                            <Pencil className="h-2.5 w-2.5" strokeWidth={1.5} />
                            Edit
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
