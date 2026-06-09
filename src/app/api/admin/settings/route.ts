import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { DEFAULT_SETTINGS } from '@/utils/settings';

const UpdateSettingsSchema = z.object({
  fcName: z.string().min(1).max(100),
  subtitle: z.string().min(1).max(100),
  welcomeTitle: z.string().min(1).max(100),
  welcomeText: z.string().min(1).max(1000),
  showLatestPost: z.boolean(),
  discordInvite: z.union([z.url(), z.literal(''), z.undefined()]),
  eventChannelId: z.union([z.string().max(30), z.literal(''), z.undefined()]),
});

// ── GET /api/admin/settings ───────────────────────────────────────────────────
export async function GET(): Promise<Response> {
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

  const settings = await db.fCSettings.findUnique({ where: { id: 'default' } });
  return NextResponse.json({ settings: settings ?? { id: 'default', ...DEFAULT_SETTINGS } });
}

// ── PATCH /api/admin/settings ─────────────────────────────────────────────────
export async function PATCH(req: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Only leaders can save settings
  if (!user || user.role !== 'LEADER') {
    return NextResponse.json({ error: 'Forbidden - only leaders can update settings' }, { status: 403 });
  }

  const parsed = UpdateSettingsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { fcName, subtitle, welcomeTitle, welcomeText, showLatestPost, discordInvite, eventChannelId } = parsed.data;

  const settings = await db.fCSettings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      fcName,
      subtitle,
      welcomeTitle,
      welcomeText,
      showLatestPost,
      discordInvite: discordInvite ?? null,
      eventChannelId: eventChannelId ?? null,
    },
    update: {
      fcName,
      subtitle,
      welcomeTitle,
      welcomeText,
      showLatestPost,
      discordInvite: discordInvite ?? null,
      eventChannelId: eventChannelId ?? null,
    },
  });

  return NextResponse.json({ success: true, settings });
}
