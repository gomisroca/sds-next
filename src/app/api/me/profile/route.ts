import { NextResponse } from 'next/server';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return NextResponse.json({
    userId: session.user.id,
    profileId: profile?.id ?? null,
  });
}
