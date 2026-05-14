import { AttendanceStatus, EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { getEventAttendanceCounts, RATE_LIMIT_MS, renderEventEmbed, updateEventOnDiscord } from '@/utils/events';

const RSVPSchema = z.object({
  status: z.enum(AttendanceStatus),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { id: eventId } = await params;

  const parsed = RSVPSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { status } = parsed.data;

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      startsAt: true,
      endsAt: true,
      status: true,
      discordChannelId: true,
      discordMessageId: true,
      createdBy: { select: { name: true } },
    },
  });

  if (!event || event.status !== EventStatus.PUBLISHED) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Rate-limit + idempotency check
  const existing = await db.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: session.user.id } },
  });

  if (existing) {
    if (existing.status === status) {
      return NextResponse.json({ success: true });
    }
    if (Date.now() - existing.updatedAt.getTime() < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Rate limited - please wait before changing your RSVP' }, { status: 429 });
    }
  }

  await db.eventAttendance.upsert({
    where: { eventId_userId: { eventId, userId: session.user.id } },
    update: { status },
    create: { eventId, userId: session.user.id, status },
  });

  // Push updated embed to Discord
  const attendance = await getEventAttendanceCounts(eventId, db);

  const embed = renderEventEmbed({
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    createdByName: event.createdBy.name,
    attendance,
  });

  if (event.discordMessageId && event.discordChannelId) {
    await updateEventOnDiscord({
      channelId: event.discordChannelId,
      messageId: event.discordMessageId,
      eventId: event.id,
      eventStartTime: event.startsAt,
      embed,
    });
  }

  return NextResponse.json({ success: true, attendance });
}
