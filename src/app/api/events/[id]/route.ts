import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/server/db';
import { getEventAttendanceCounts } from '@/utils/events';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
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
      createdBy: { select: { name: true } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.status !== EventStatus.PUBLISHED) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const attendance = await getEventAttendanceCounts(event.id, db);

  return NextResponse.json({ event, attendance });
}
