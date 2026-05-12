import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { getEventAttendanceCounts, postEventToDiscord } from '@/utils/events';

// ── Validation ───────────────────────────────────────────────────────────────

const CreateEventSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  imageUrl: z.url().optional(),
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime().optional(),
  // If true, immediately publish to Discord after creation
  publishNow: z.boolean().default(false),
});

// ── POST /api/events ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
  // Auth — must be signed in
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  // Role — only officers and leaders can create events
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Validate body
  const parsed = CreateEventSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { name, description, location, imageUrl, startsAt, endsAt, publishNow } = parsed.data;

  const startDate = new Date(startsAt);
  const endDate = endsAt ? new Date(endsAt) : undefined;

  if (endDate && endDate <= startDate) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 });
  }

  // Create the event as DRAFT first
  const event = await db.event.create({
    data: {
      name,
      description,
      location,
      imageUrl,
      startsAt: startDate,
      endsAt: endDate,
      status: EventStatus.DRAFT,
      createdById: user.id,
    },
  });

  // Optionally publish to Discord immediately
  if (publishNow) {
    const attendance = await getEventAttendanceCounts(event.id, db);

    const eventForEmbed = {
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      createdByName: user.name,
      attendance,
    };

    const botResult = await postEventToDiscord(eventForEmbed);

    if (botResult) {
      await db.event.update({
        where: { id: event.id },
        data: {
          status: EventStatus.PUBLISHED,
          discordChannelId: botResult.channelId,
          discordMessageId: botResult.messageId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        status: botResult ? EventStatus.PUBLISHED : EventStatus.DRAFT,
        discordPosted: !!botResult,
      },
    });
  }

  return NextResponse.json({ success: true, event });
}

// ── GET /api/events ───────────────────────────────────────────────────────────
// Returns published (and upcoming) events for the homepage / events page.

export async function GET(): Promise<Response> {
  const events = await db.event.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      startsAt: { gte: new Date() },
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
      createdBy: { select: { name: true } },
      _count: { select: { attendances: true } },
    },
  });

  return NextResponse.json({ events });
}
