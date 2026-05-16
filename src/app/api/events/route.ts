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
  startsAt: z.iso.datetime().optional(), // optional when saving as template
  endsAt: z.iso.datetime().optional(),
  publishNow: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
  templateName: z.string().min(1).max(100).optional(),
});

// ── POST /api/events ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true },
  });

  if (!user || (user.role !== 'MEMBER' && user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    return NextResponse.json({ error: 'Forbidden: Only members can create events' }, { status: 403 });
  }
  const parsed = CreateEventSchema.safeParse(await req.json());
  console.log(parsed);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { name, description, location, imageUrl, startsAt, endsAt, publishNow, isTemplate, templateName } = parsed.data;

  const startDate = startsAt ? new Date(startsAt) : undefined;
  const endDate = endsAt ? new Date(endsAt) : undefined;

  if (startDate && endDate && endDate <= startDate) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 });
  }

  if (isTemplate && user.role !== 'OFFICER' && user.role !== 'LEADER') {
    return NextResponse.json({ error: 'Forbidden: Only officers and leaders can create templates' }, { status: 403 });
  }
  if (isTemplate && !templateName) {
    return NextResponse.json({ error: 'templateName is required when saving as template' }, { status: 400 });
  }

  // Non-template events must have a start date
  if (!isTemplate && !startDate) {
    return NextResponse.json({ error: 'startsAt is required for non-template events' }, { status: 400 });
  }

  // Templates are always saved as DRAFT and never published to Discord
  if (isTemplate) {
    const template = await db.event.create({
      data: {
        name,
        description,
        location,
        imageUrl,
        startsAt: startDate ?? new Date(0),
        endsAt: endDate,
        status: EventStatus.DRAFT,
        isTemplate: true,
        templateName,
        createdById: user.id,
      },
    });
    return NextResponse.json({ success: true, event: template });
  }

  const event = await db.event.create({
    data: {
      name,
      description,
      location,
      imageUrl,
      startsAt: startDate!,
      endsAt: endDate,
      status: EventStatus.DRAFT,
      createdById: user.id,
    },
  });

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

    // Publish regardless of whether the bot call succeeded -
    // the bot is optional infrastructure, not a gate on publishing.
    const published = await db.event.update({
      where: { id: event.id },
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
      event: { ...published, discordPosted: !!botResult },
    });
  }

  return NextResponse.json({ success: true, event });
}

// ── GET /api/events ───────────────────────────────────────────────────────────
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
