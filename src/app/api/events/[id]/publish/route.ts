import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { getEventAttendanceCounts, postEventToDiscord } from '@/utils/events';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

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
      isTemplate: true,
      createdBy: { select: { name: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (event.isTemplate) {
    return NextResponse.json({ error: 'Templates cannot be published' }, { status: 400 });
  }
  if (event.status !== EventStatus.DRAFT) {
    return NextResponse.json({ error: `Event is already ${event.status.toLowerCase()}` }, { status: 409 });
  }
  if (!event.startsAt) {
    return NextResponse.json({ error: 'Event must have a start date before publishing' }, { status: 400 });
  }

  const attendance = await getEventAttendanceCounts(event.id, db);

  const eventForEmbed = {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    imageUrl: event.imageUrl,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    createdByName: event.createdBy.name,
    attendance,
  };

  const botResult = await postEventToDiscord(eventForEmbed);

  const published = await db.event.update({
    where: { id },
    data: {
      status: EventStatus.PUBLISHED,
      ...(botResult && {
        discordChannelId: botResult.channelId,
        discordMessageId: botResult.messageId,
      }),
    },
  });

  return NextResponse.json({
    success: true,
    event: published,
    discordPosted: !!botResult,
  });
}
