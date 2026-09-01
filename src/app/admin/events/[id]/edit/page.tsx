import { notFound, redirect } from 'next/navigation';

import { BackLink } from '@/app/components/ui/back-link';
import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { CreateEventWizard } from '@/app/events/event-wizard';
import { type FormData } from '@/app/events/event-wizard/types';
import { auth } from '@/server/auth';
import { db } from '@/server/db';

async function getEvent(id: string) {
  return db.event.findUnique({
    where: { id, isTemplate: false },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      imageUrl: true,
      startsAt: true,
      endsAt: true,
      status: true,
    },
  });
}

function formatDateInput(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatTimeInput(date: Date | null): string {
  if (!date) return '20:00';
  return date.toISOString().slice(11, 16); // HH:MM
}

export default async function AdminEventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/?toast=unauthorized');
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    redirect('/admin');
  }

  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  // Only draft events are editable
  if (event.status !== 'DRAFT') {
    redirect(`/events/${id}`);
  }

  const hasEndTime = !!event.endsAt;

  const initialData: FormData = {
    fromTemplateId: '',
    name: event.name,
    description: event.description ?? '',
    location: event.location ?? '',
    imageUrl: event.imageUrl ?? '',
    isTemplate: false,
    templateName: '',
    startsAtDate: formatDateInput(event.startsAt),
    startsAtTime: formatTimeInput(event.startsAt),
    endsAtDate: hasEndTime ? formatDateInput(event.endsAt) : '',
    endsAtTime: hasEndTime ? formatTimeInput(event.endsAt) : '22:00',
    hasEndTime,
    publishNow: false,
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-10">
        <BackLink href={`/events/${id}`}>Back to Event</BackLink>

        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin · Events</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/90 uppercase">Edit Event</h1>
        <OrnamentalRule className="max-w-xs" />
        <p className="mt-6 text-sm font-light text-white/60">
          Editing <span className="text-white/80">{event.name}</span> &mdash; draft
        </p>
      </div>

      <CreateEventWizard mode="edit" eventId={id} initialData={initialData} />
    </div>
  );
}
