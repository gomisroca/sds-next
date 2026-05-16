import { Activity, Job, Playstyle } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  portrait: z.url().optional().nullable(),
  banner: z.url().optional().nullable(),
  job: z.enum(Job),
  activities: z.array(z.enum(Activity)).default([]),
  playstyle: z.enum(Playstyle),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { id } = await params;

  const profile = await db.profile.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const editor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  const isOwner = profile.userId === session.user.id;
  const isLeader = editor?.role === 'LEADER';

  if (!isOwner && !isLeader) {
    return NextResponse.json({ error: 'Forbidden — profile owner or leader only' }, { status: 403 });
  }

  const parsed = UpdateProfileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { name, bio, portrait, banner, job, activities, playstyle } = parsed.data;

  const updated = await db.profile.update({
    where: { id },
    data: { name, bio, portrait, banner, job, activities, playstyle },
  });

  return NextResponse.json({ success: true, profile: updated });
}
