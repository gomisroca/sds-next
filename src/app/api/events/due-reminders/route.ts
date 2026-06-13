import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/env';
import { db } from '@/server/db';

/**
 * GET /api/events/due-reminders
 * Returns published events starting in 24h ± 15min that haven't been reminded yet.
 * Called by the bot scheduler every 5 minutes.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get('x-bot-secret') !== env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const startRange = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 15 * 60 * 1000);
  const endRange = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000);

  const events = await db.event.findMany({
    where: {
      status: EventStatus.PUBLISHED,
      isTemplate: false,
      startsAt: { gte: startRange, lte: endRange },
      reminderSentAt: null,
    },
    select: {
      id: true,
      name: true,
      startsAt: true,
    },
  });

  return NextResponse.json(events);
}
