import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/env';
import { db } from '@/server/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (req.headers.get('x-bot-secret') !== env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Mark the event's reminder as sent
    const event = await db.event.update({
      where: { id },
      data: { reminderSentAt: new Date() },
      select: { id: true, reminderSentAt: true },
    });

    return NextResponse.json({ success: true, event }, { status: 200 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error marking reminder as sent:', error);
    return NextResponse.json({ error: 'Failed to mark reminder as sent' }, { status: 500 });
  }
}
