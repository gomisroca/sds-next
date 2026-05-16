import { Activity, Job, Playstyle } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

const CreateProfileSchema = z.object({
  userId: z.string(), // the user to create the profile for
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional(),
  portrait: z.url().optional(),
  banner: z.url().optional(),
  job: z.enum(Job),
  activities: z.array(z.enum(Activity)).default([]),
  playstyle: z.enum(Playstyle),
});

export async function POST(req: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const creator = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!creator || (creator.role !== 'OFFICER' && creator.role !== 'LEADER')) {
    return NextResponse.json({ error: 'Forbidden — officers and above only' }, { status: 403 });
  }

  const parsed = CreateProfileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { userId, name, bio, portrait, banner, job, activities, playstyle } = parsed.data;

  // Target user must exist and not be a guest
  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (targetUser.role === 'GUEST') {
    return NextResponse.json({ error: 'Cannot create a profile for a guest' }, { status: 400 });
  }

  // One profile per user
  const existing = await db.profile.findUnique({ where: { userId } });
  if (existing) {
    return NextResponse.json({ error: 'User already has a profile' }, { status: 409 });
  }

  const profile = await db.profile.create({
    data: { userId, name, bio, portrait, banner, job, activities, playstyle },
  });

  return NextResponse.json({ success: true, profile });
}
