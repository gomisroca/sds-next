import type { Prisma } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

const UpdatePostSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.record(z.string(), z.unknown()), // Tiptap JSON
  coverImage: z.union([z.string().url(), z.literal(''), z.undefined()]),
  published: z.boolean(),
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
  const post = await db.post.findUnique({ where: { id }, select: { id: true, published: true } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const parsed = UpdatePostSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { title, excerpt, content, coverImage, published } = parsed.data;

  const updated = await db.post.update({
    where: { id },
    data: {
      title,
      excerpt: excerpt ?? null,
      content: content as Prisma.InputJsonValue,
      coverImage: coverImage ?? null,
      published,
      // Only set publishedAt when first publishing
      publishedAt: published && !post.published ? new Date() : undefined,
    },
  });

  return NextResponse.json({ success: true, post: updated });
}

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
  await db.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
