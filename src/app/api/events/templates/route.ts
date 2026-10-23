import { NextResponse } from 'next/server';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

export async function GET(): Promise<Response> {
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

  const templates = await db.event.findMany({
    where: { isTemplate: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      templateName: true,
      name: true,
      description: true,
      location: true,
      imageUrl: true,
      createdBy: { select: { name: true } },
    },
  });

  return NextResponse.json({ templates });
}
