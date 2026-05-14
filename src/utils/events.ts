import type { PrismaClient } from 'generated/prisma';

// ── Constants ────────────────────────────────────────────────────────────────
export const RATE_LIMIT_MS = 5_000;

// ── Types ────────────────────────────────────────────────────────────────────

export interface AttendanceCounts {
  attending: number;
  notAttending: number;
  maybe: number;
  // Names for the embed fields (capped to avoid huge embeds)
  attendingNames: string[];
  maybeNames: string[];
}

export interface EventForEmbed {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date | null;
  createdByName: string | null;
  attendance: AttendanceCounts;
}

// ── Attendance helpers ───────────────────────────────────────────────────────
const MAX_NAMES_IN_EMBED = 20;

/**
 * Fetch and shape attendance counts + name lists for a given event.
 * Imported by both the RSVP route and the event creation route.
 */
export async function getEventAttendanceCounts(eventId: string, db: PrismaClient): Promise<AttendanceCounts> {
  const rows = await db.eventAttendance.findMany({
    where: { eventId },
    select: { status: true, user: { select: { name: true } } },
  });

  const attending = rows.filter((r) => r.status === 'ATTENDING');
  const notAttending = rows.filter((r) => r.status === 'NOT_ATTENDING');
  const maybe = rows.filter((r) => r.status === 'MAYBE');

  const toNames = (list: { user: { name: string | null } }[]): string[] =>
    list.map((r) => r.user.name ?? 'Unknown').slice(0, MAX_NAMES_IN_EMBED);

  return {
    attending: attending.length,
    notAttending: notAttending.length,
    maybe: maybe.length,
    attendingNames: toNames(attending),
    maybeNames: toNames(maybe),
  };
}

// ── Discord embed ─────────────────────────────────────────────────────────────
const STATUS_EMOJI = {
  attending: '✅',
  maybe: '❓',
  notAttending: '❌',
};

function formatDate(date: Date): string {
  // Discord timestamp format - renders in the user's local timezone
  return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
}

function formatNameList(names: string[], total: number): string {
  if (total === 0) return '*No one yet*';
  const shown = names.join(', ');
  const extra = total - names.length;
  return extra > 0 ? `${shown} *+${extra} more*` : shown;
}

/**
 * Renders a Discord embed object for an event.
 */
export function renderEventEmbed(event: EventForEmbed): object {
  const { attendance } = event;

  const fields = [
    {
      name: '📅 Starts',
      value: formatDate(event.startsAt),
      inline: true,
    },
    ...(event.endsAt ? [{ name: '🏁 Ends', value: formatDate(event.endsAt), inline: true }] : []),
    ...(event.location ? [{ name: '📍 Location', value: event.location, inline: true }] : []),
    { name: '\u200b', value: '\u200b', inline: false }, // spacer
    {
      name: `${STATUS_EMOJI.attending} Attending (${attendance.attending})`,
      value: formatNameList(attendance.attendingNames, attendance.attending),
      inline: true,
    },
    {
      name: `${STATUS_EMOJI.maybe} Maybe (${attendance.maybe})`,
      value: formatNameList(attendance.maybeNames, attendance.maybe),
      inline: true,
    },
    {
      name: `${STATUS_EMOJI.notAttending} Not Attending (${attendance.notAttending})`,
      value: String(attendance.notAttending),
      inline: true,
    },
  ];

  return {
    title: event.name,
    description: event.description ?? undefined,
    color: 0x8b1a00, // deep crimson
    fields,
    footer: {
      text: `Created by ${event.createdByName ?? 'Unknown'} · Sleeping Dragons FC`,
    },
    timestamp: new Date().toISOString(),
  };
}

// ── Bot communication →PH ───────────────────────────
export interface BotPostResult {
  channelId: string;
  messageId: string;
}

/**
 * Ask the bot to post a new event embed in the configured channel.
 * Returns the channelId + messageId to store on the Event row.
 * →PH
 */
export async function postEventToDiscord(_event: EventForEmbed): Promise<BotPostResult | null> {
  // TODO
  // const { env } = await import("@/env");
  // const res = await fetch(`${env.BOT_URL}/post-event`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "x-bot-secret": env.BOT_SECRET,
  //   },
  //   body: JSON.stringify({ embed: renderEventEmbed(_event), eventId: _event.id }),
  // });
  // if (!res.ok) return null;
  // return res.json() as Promise<BotPostResult>;

  console.warn('[postEventToDiscord] Bot not configured - skipping Discord post');
  return null;
}

/**
 * Ask the bot to update an existing embed after an RSVP change.
 *
 * →PH
 */
export async function updateEventOnDiscord(args: {
  channelId: string;
  messageId: string;
  eventId: string;
  eventStartTime: Date;
  embed: object;
}): Promise<void> {
  // TODO
  // const { env } = await import("@/env");
  // await fetch(`${env.BOT_URL}/update-event`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "x-bot-secret": env.BOT_SECRET,
  //   },
  //   body: JSON.stringify(args),
  // });

  console.warn('[updateEventOnDiscord] Bot not configured - skipping Discord update', args.eventId);
}
