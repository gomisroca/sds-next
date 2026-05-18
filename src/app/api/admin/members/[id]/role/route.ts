import { Role } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

const UpdateRoleSchema = z.object({
  role: z.enum(Role),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  // Only leaders can change roles - officers can view but not promote
  const editor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!editor || editor.role !== 'LEADER') {
    return NextResponse.json({ error: 'Forbidden - only leaders can change roles' }, { status: 403 });
  }

  const { id } = await params;

  // Can't change your own role
  if (id === session.user.id) {
    return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const parsed = UpdateRoleSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data: { role: parsed.data.role },
    select: { id: true, role: true },
  });

  return NextResponse.json({ success: true, user: updated });
}
