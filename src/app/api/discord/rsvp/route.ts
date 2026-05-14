import { AttendanceStatus, EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '@/env';
import { db } from '@/server/db';
import { getEventAttendanceCounts, RATE_LIMIT_MS, renderEventEmbed, updateEventOnDiscord } from '@/utils/events';

// ── Validation ───────────────────────────────────────────────────────────────
const DiscordRSVPSchema = z.object({
  eventId: z.string(),
  discordUserId: z.string(),
  status: z.enum(AttendanceStatus),
});

// ── POST /api/discord/rsvp ────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<Response> {
  // Bot authentication
  if (req.headers.get('x-bot-secret') !== env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate body
  const parsed = DiscordRSVPSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { eventId, discordUserId, status } = parsed.data;

  // Load event with just enough to check it exists and is still active
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

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.status !== EventStatus.PUBLISHED) {
    return NextResponse.json({ error: 'Event is not accepting RSVPs' }, { status: 409 });
  }

  // Resolve the Discord user to a site user via the linked OAuth account
  const account = await db.account.findFirst({
    where: { provider: 'discord', providerAccountId: discordUserId },
    select: { userId: true },
  });

  if (!account) {
    return NextResponse.json({ error: 'Discord account not linked to a site account' }, { status: 404 });
  }

  // Rate-limit + idempotency check
  const existing = await db.eventAttendance.findUnique({
    where: { eventId_userId: { eventId, userId: account.userId } },
  });

  if (existing) {
    // Same status - nothing to do
    if (existing.status === status) {
      return NextResponse.json({ success: true });
    }
    // Changed too recently
    if (Date.now() - existing.updatedAt.getTime() < RATE_LIMIT_MS) {
      return NextResponse.json({ error: 'Rate limited - please wait before changing your RSVP' }, { status: 429 });
    }
  }

  // Upsert attendance
  await db.eventAttendance.upsert({
    where: { eventId_userId: { eventId, userId: account.userId } },
    update: { status },
    create: { eventId, userId: account.userId, status },
  });

  // Rebuild attendance counts and push updated embed to Discord
  const attendance = await getEventAttendanceCounts(eventId, db);

  const eventForEmbed = {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    createdByName: event.createdBy.name,
    attendance,
  };

  const embed = renderEventEmbed(eventForEmbed);

  if (event.discordMessageId && event.discordChannelId) {
    await updateEventOnDiscord({
      channelId: event.discordChannelId,
      messageId: event.discordMessageId,
      eventId: event.id,
      eventStartTime: event.startsAt,
      embed,
    });
  }

  return NextResponse.json({ success: true });
}
