import { type PrismaClient } from 'generated/prisma';

// ── Constants ────────────────────────────────────────────────────────────────
export const RATE_LIMIT_MS = 5_000;

// ── Types ────────────────────────────────────────────────────────────────────
export interface AttendanceCounts {
  attending: number;
  notAttending: number;
  maybe: number;
}

export interface EventForEmbed {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  startsAt: Date;
  endsAt: Date | null;
  createdByName: string | null;
  attendance: AttendanceNames;
}

function formatDiscordTimestamp(date: Date): string {
  // Discord timestamp format - renders in the user's local timezone
  return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
}

export async function getEventAttendanceCounts(eventId: string, db: PrismaClient): Promise<AttendanceCounts> {
  const rows = await db.eventAttendance.findMany({
    where: { eventId },
    select: { status: true },
  });

  const attending = rows.filter((r) => r.status === 'ATTENDING');
  const notAttending = rows.filter((r) => r.status === 'NOT_ATTENDING');
  const maybe = rows.filter((r) => r.status === 'MAYBE');

  return {
    attending: attending.length,
    notAttending: notAttending.length,
    maybe: maybe.length,
  };
}
export interface AttendanceNames {
  attending: string[];
  notAttending: string[];
  maybe: string[];
}
export async function getEventAttendanceNames(eventId: string, db: PrismaClient): Promise<AttendanceNames> {
  const rows = await db.eventAttendance.findMany({
    where: { eventId },
    select: {
      status: true,
      discordId: true,
      discordName: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const getNames = (status: string): string[] =>
    rows.filter((row) => row.status === status).map((row) => String(row.discordName ?? `User ${row.discordId}`));

  return {
    attending: getNames('ATTENDING'),
    notAttending: getNames('NOT_ATTENDING'),
    maybe: getNames('MAYBE'),
  };
}

const STATUS_EMOJI = {
  attending: '✅',
  maybe: '❓',
  notAttending: '❌',
};

function formatNameList(names: string[]): string {
  if (names.length === 0) return '0';

  const maxNames = 20;
  const shown = names.slice(0, maxNames);
  const extra = names.length - shown.length;

  return extra > 0 ? `${shown.join('\n')}\n*+${extra} more*` : shown.join('\n');
}

/**
 * Renders a Discord embed object for an event.
 */
export function renderEventEmbed(event: EventForEmbed): object {
  const fields = [
    {
      name: '📅 Starts',
      value: formatDiscordTimestamp(event.startsAt),
      inline: true,
    },
    ...(event.endsAt ? [{ name: '🏁 Ends', value: formatDiscordTimestamp(event.endsAt), inline: true }] : []),
    ...(event.location ? [{ name: '📍 Location', value: event.location, inline: true }] : []),
    {
      name: `${STATUS_EMOJI.attending} Attending (${event.attendance.attending.length})`,
      value: formatNameList(event.attendance.attending),
      inline: true,
    },
    {
      name: `${STATUS_EMOJI.maybe} Maybe (${event.attendance.maybe.length})`,
      value: formatNameList(event.attendance.maybe),
      inline: true,
    },
    {
      name: `${STATUS_EMOJI.notAttending} Not Attending (${event.attendance.notAttending.length})`,
      value: formatNameList(event.attendance.notAttending),
      inline: true,
    },
  ];

  return {
    title: event.name,
    description: event.description ?? undefined,
    color: 0x8b1a00,
    ...(event.imageUrl ? { image: { url: event.imageUrl } } : {}),
    fields,
    footer: {
      text: `Created by ${event.createdByName ?? 'Unknown'} · Sleeping Dragons`,
    },
    timestamp: new Date().toISOString(),
  };
}

// ── Bot communication ─────────────────────────────────────────────────────────
export interface BotPostResult {
  channelId: string;
  messageId: string;
}

/**
 * Ask the bot to post a new event embed in the configured channel.
 */
export async function postEventToDiscord(event: EventForEmbed): Promise<BotPostResult | null> {
  const { env } = await import('@/env');
  const { getSettings } = await import('@/utils/settings');

  const settings = await getSettings();
  const channelId = settings.eventChannelId;

  if (!channelId) {
    // eslint-disable-next-line no-console
    console.warn('[postEventToDiscord] No eventChannelId configured in settings - skipping');
    return null;
  }

  try {
    const res = await fetch(`${env.BOT_URL}/post-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bot-secret': env.BOT_SECRET,
      },
      body: JSON.stringify({
        channelId,
        embed: renderEventEmbed(event),
        eventId: event.id,
        eventStartTime: event.startsAt.toISOString(),
      }),
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error('[postEventToDiscord] Bot returned', res.status, await res.text());
      return null;
    }

    return res.json() as Promise<BotPostResult>;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[postEventToDiscord] Network error:', err);
    return null;
  }
}

/**
 * Ask the bot to update an existing embed after an RSVP change.
 */
export async function updateEventOnDiscord(args: {
  channelId: string;
  messageId: string;
  eventId: string;
  eventStartTime: Date;
  embed: object;
}): Promise<void> {
  const { env } = await import('@/env');

  try {
    const res = await fetch(`${env.BOT_URL}/update-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bot-secret': env.BOT_SECRET,
      },
      body: JSON.stringify({
        ...args,
        eventStartTime: args.eventStartTime.toISOString(),
      }),
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error('[updateEventOnDiscord] Bot returned', res.status, await res.text());
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[updateEventOnDiscord] Network error:', err);
  }
}

export function formatEventDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatEventTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
