import { EventStatus } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { getEventAttendanceCounts } from '@/utils/events';

// ── GET /api/events/[id] ──────────────────────────────────────────────────────
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

  if (!event || event.status !== EventStatus.PUBLISHED) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  const attendance = await getEventAttendanceCounts(event.id, db);
  return NextResponse.json({ event, attendance });
}

// ── PATCH /api/events/[id] ────────────────────────────────────────────────────
// Updates a template. Officers+ only, templates only.
const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  templateName: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  location: z.string().max(200).optional(),
  imageUrl: z.union([z.url(), z.literal(''), z.undefined()]),
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

  const template = await db.event.findUnique({
    where: { id },
    select: { id: true, isTemplate: true },
  });

  if (!template) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!template.isTemplate) {
    return NextResponse.json({ error: 'This endpoint only updates templates' }, { status: 400 });
  }

  const parsed = UpdateTemplateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { name, templateName, description, location, imageUrl } = parsed.data;

  const updated = await db.event.update({
    where: { id },
    data: {
      name,
      templateName,
      description: description ?? null,
      location: location ?? null,
      imageUrl: imageUrl ?? null,
    },
  });

  return NextResponse.json({ success: true, event: updated });
}
