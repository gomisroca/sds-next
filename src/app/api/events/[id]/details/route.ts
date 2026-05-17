import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

const UpdateEventDetailsSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  imageUrl: z.union([z.string().url(), z.literal(''), z.undefined()]),
  startsAt: z.string().datetime(),
  endsAt: z.union([z.string().datetime(), z.undefined()]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
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
    select: { status: true, isTemplate: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }
  if (event.isTemplate) {
    return NextResponse.json({ error: 'Use PATCH /api/events/[id] for templates' }, { status: 400 });
  }
  if (event.status !== EventStatus.DRAFT) {
    return NextResponse.json({ error: 'Only draft events can be edited — cancel the event first' }, { status: 409 });
  }

  const parsed = UpdateEventDetailsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { name, description, location, imageUrl, startsAt, endsAt } = parsed.data;

  const startDate = new Date(startsAt);
  const endDate = endsAt ? new Date(endsAt) : undefined;

  if (endDate && endDate <= startDate) {
    return NextResponse.json({ error: 'endsAt must be after startsAt' }, { status: 400 });
  }

  const updated = await db.event.update({
    where: { id },
    data: {
      name,
      description: description ?? null,
      location: location ?? null,
      imageUrl: imageUrl ?? null,
      startsAt: startDate,
      endsAt: endDate ?? null,
    },
  });

  return NextResponse.json({ success: true, event: updated });
}
