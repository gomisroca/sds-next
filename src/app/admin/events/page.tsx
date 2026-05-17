import { EventStatus } from 'generated/prisma';
import { FileText, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

async function getEvents() {
  return db.event.findMany({
    where: { status: EventStatus.DRAFT, isTemplate: false },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      templateName: true,
      description: true,
      location: true,
      imageUrl: true,
      createdAt: true,
      createdBy: { select: { name: true } },
    },
  });
}

export default async function AdminTemplatesPage() {
  const events = await getEvents();

  return (
    <div className="max-w-3xl">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin</p>
          <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Event Templates</h1>
          <OrnamentalRule className="max-w-xs" />
          <p className="mt-6 text-sm font-light text-white/35">
            {events.length} event{events.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <Link
          href="/events/new"
          className="mt-1 flex shrink-0 items-center gap-2 border border-red-800/50 bg-red-950/20 px-5 py-2 text-xs font-light tracking-[0.2em] text-red-400/85 uppercase transition-all hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300">
          <Plus className="h-3 w-3" strokeWidth={2} />
          New EVent
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <FileText className="h-8 w-8 text-red-900/30" strokeWidth={1} />
          <p className="text-sm font-light tracking-widest text-white/20 uppercase">No events yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((e, i) => (
            <EventRow key={e.id} event={e} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({ event }: { event: Awaited<ReturnType<typeof getEvents>>[number]; index: number }) {
  return (
    <div className="group relative flex items-center gap-4 border border-red-900/20 bg-white/[0.02] p-5 transition-all duration-200 hover:border-red-800/30 hover:bg-white/[0.03]">
      <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-red-700/30" />

      {/* Banner thumbnail */}
      {event.imageUrl ? (
        <div className="h-14 w-20 shrink-0 overflow-hidden border border-red-900/20">
          <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-14 w-20 shrink-0 items-center justify-center border border-red-900/15 bg-red-950/10">
          <FileText className="h-5 w-5 text-red-900/30" strokeWidth={1} />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-light text-white/75">{event.name}</p>
        <p className="mt-0.5 truncate text-xs font-light text-white/30">{event.name}</p>
        {event.location && (
          <p className="mt-0.5 text-[10px] font-light tracking-widest text-white/20 uppercase">{event.location}</p>
        )}
      </div>

      {/* Meta */}
      <div className="shrink-0 text-right">
        <p className="text-xs font-light text-white/20">
          {event.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        {event.createdBy.name && <p className="mt-0.5 text-[10px] font-light text-white/15">{event.createdBy.name}</p>}
      </div>

      {/* Edit button */}
      <Link
        href={`/admin/events/${event.id}/edit`}
        className="flex shrink-0 items-center gap-1.5 border border-red-900/20 px-3 py-1.5 text-xs font-light tracking-[0.2em] text-white/30 uppercase transition-all hover:border-red-800/40 hover:text-white/60">
        <Pencil className="h-3 w-3" strokeWidth={1.5} />
        Edit
      </Link>
    </div>
  );
}
