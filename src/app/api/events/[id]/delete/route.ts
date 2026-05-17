import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

const DELETABLE_STATUSES: EventStatus[] = [EventStatus.DRAFT, EventStatus.CANCELLED];

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const event = await db.event.findUnique({
    where: { id },
    select: { status: true, isTemplate: true, name: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (!event.isTemplate && !DELETABLE_STATUSES.includes(event.status)) {
    return NextResponse.json({ error: 'Published events must be cancelled before deleting' }, { status: 409 });
  }

  await db.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
