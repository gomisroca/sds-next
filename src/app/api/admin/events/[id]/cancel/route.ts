import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const editor = await db.user.findUnique({
    where: { id: session.user.id, role: { notIn: ['GUEST', 'MEMBER'] } },
  });

  if (!editor) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    select: { status: true, isTemplate: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (event.isTemplate) {
    return NextResponse.json({ error: 'Templates cannot be cancelled' }, { status: 400 });
  }
  if (event.status !== EventStatus.PUBLISHED) {
    return NextResponse.json({ error: 'Only published events can be cancelled' }, { status: 409 });
  }

  const cancelled = await db.event.update({
    where: { id },
    data: { status: EventStatus.CANCELLED },
  });

  // TODO: notify Discord that the event is cancelled
  // await updateEventOnDiscord({ ... embed with CANCELLED status ... })

  return NextResponse.json({ success: true, event: cancelled });
}
