import { EventStatus } from 'generated/prisma';
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { db } from '@/server/db';
import { getEventAttendanceCounts } from '@/utils/events';

import AttendanceCounts from './attendance-counts';

export const revalidate = 30;

async function getEvent(id: string) {
  const event = await db.event.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      imageUrl: true,
      startsAt: true,
      endsAt: true,
      status: true,
      createdBy: { select: { name: true } },
    },
  });

  if (!event || event.status !== EventStatus.PUBLISHED) return null;

  const attendance = await getEventAttendanceCounts(event.id, db);
  return { event, attendance };
}

function formatFull(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getEvent(id);
  if (!data) notFound();

  const { event, attendance } = data;
  const hasImage = !!event.imageUrl;

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
        {/* Back link */}
        <Link
          href="/events"
          className="group mb-10 inline-flex items-center gap-2 text-xs font-light tracking-[0.25em] text-white/30 uppercase transition-colors duration-200 hover:text-white/60">
          <ArrowLeft
            className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5"
            strokeWidth={1.5}
          />
          All Events
        </Link>

        {/* Banner image */}
        {hasImage && (
          <div className="relative mb-10 h-56 w-full overflow-hidden rounded-sm border border-red-900/20 md:h-72">
            <img src={event.imageUrl!} alt={event.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060404] via-transparent to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Upcoming Event</p>
          <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/90 md:text-4xl lg:text-5xl">
            {event.name}
          </h1>
          <OrnamentalRule className="max-w-xs" />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Left — description */}
          <div className="md:col-span-2">
            {event.description ? (
              <p className="text-base leading-relaxed font-light text-white/55">{event.description}</p>
            ) : (
              <p className="text-sm font-light text-white/25 italic">No description provided.</p>
            )}

            {event.createdBy.name && (
              <p className="mt-8 text-xs font-light tracking-widest text-white/20 uppercase">
                Posted by {event.createdBy.name}
              </p>
            )}
          </div>

          {/* Right — meta + attendance */}
          <div className="flex flex-col gap-6">
            {/* Date / time / location */}
            <div className="flex flex-col gap-3 border border-red-900/20 bg-white/[0.02] p-5">
              <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-red-700/30" />

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-700/50" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-light text-white/70">{formatFull(event.startsAt)}</p>
                  {event.endsAt && formatFull(event.endsAt) !== formatFull(event.startsAt) && (
                    <p className="text-xs font-light text-white/35">to {formatFull(event.endsAt)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-3.5 w-3.5 shrink-0 text-red-700/50" strokeWidth={1.5} />
                <p className="text-sm font-light text-white/70">
                  {formatTime(event.startsAt)}
                  {event.endsAt ? ` – ${formatTime(event.endsAt)}` : ''}
                </p>
              </div>

              {event.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-red-700/50" strokeWidth={1.5} />
                  <p className="text-sm font-light text-white/70">{event.location}</p>
                </div>
              )}
            </div>

            {/* Attendance counts */}
            <AttendanceCounts attendance={attendance} />
          </div>
        </div>
      </div>
    </main>
  );
}
