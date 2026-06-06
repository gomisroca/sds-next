import type { Prisma } from 'generated/prisma';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 1;
  while (await db.post.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().max(500).optional(),
  content: z.record(z.string(), z.unknown()), // Tiptap JSON
  coverImage: z.url().optional(),
  published: z.boolean().default(false),
});

export async function GET(): Promise<Response> {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest): Promise<Response> {
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

  const parsed = CreatePostSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { title, excerpt, content, coverImage, published } = parsed.data;
  const slug = await uniqueSlug(slugify(title));

  const post = await db.post.create({
    data: {
      title,
      slug,
      excerpt,
      content: content as Prisma.InputJsonValue,
      coverImage,
      published,
      publishedAt: published ? new Date() : null,
      authorId: session.user.id,
    },
  });

  return NextResponse.json({ success: true, post });
}
