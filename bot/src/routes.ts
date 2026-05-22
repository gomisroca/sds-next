import type { Client, TextChannel } from 'discord.js';
import type { Express, Request, Response } from 'express';

import { type DiscordEmbed, renderRSVPButtons } from './embed.js';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PostEventBody {
  channelId: string;
  embed: DiscordEmbed;
  eventId: string;
  eventStartTime: string;
}

interface UpdateEventBody {
  channelId: string;
  messageId: string;
  embed: DiscordEmbed;
  eventId: string;
  eventStartTime: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function checkSecret(req: Request, res: Response, botSecret: string): boolean {
  if (req.headers['x-bot-secret'] !== botSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

function isClosed(eventStartTime: string): boolean {
  return new Date(eventStartTime) <= new Date();
}

function logError(...args: unknown[]): void {
  process.stderr.write(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ') + '\n');
}

// ── Routes ────────────────────────────────────────────────────────────────────
export function registerRoutes(app: Express, client: Client, botSecret: string): void {
  // ── GET /health ─────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      bot: client.isReady() ? 'ready' : 'not ready',
      tag: client.user?.tag ?? null,
    });
  });

  // ── POST /post-event ────────────────────────────────────────────────────────
  app.post('/post-event', (req: Request, res: Response) => {
    void handlePostEvent(req, res, client, botSecret);
  });

  // ── POST /update-event ──────────────────────────────────────────────────────
  app.post('/update-event', (req: Request, res: Response) => {
    void handleUpdateEvent(req, res, client, botSecret);
  });
}

// ── Handlers ───────────────────────
async function handlePostEvent(req: Request, res: Response, client: Client, botSecret: string): Promise<void> {
  if (!checkSecret(req, res, botSecret)) return;

  const { channelId, embed, eventId, eventStartTime } = req.body as PostEventBody;

  if (!channelId || !embed || !eventId || !eventStartTime) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const closed = isClosed(eventStartTime);
  if (closed) embed.footer = { text: '⛔ RSVPs are closed' };

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased()) {
      res.status(400).json({ error: 'Channel not found or not text-based' });
      return;
    }

    const message = await (channel as TextChannel).send({
      content: 'React to RSVP!',
      embeds: [embed],
      components: renderRSVPButtons(eventId, closed),
    });

    res.json({ channelId: message.channelId, messageId: message.id });
  } catch (err) {
    logError('[post-event] Error:', err);
    res.status(500).json({ error: 'Failed to post event' });
  }
}

async function handleUpdateEvent(req: Request, res: Response, client: Client, botSecret: string): Promise<void> {
  if (!checkSecret(req, res, botSecret)) return;

  const { channelId, messageId, embed, eventId, eventStartTime } = req.body as UpdateEventBody;

  if (!channelId || !messageId || !embed || !eventId || !eventStartTime) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const closed = isClosed(eventStartTime);
  if (closed) embed.footer = { text: '⛔ RSVPs are closed' };

  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel?.isTextBased()) {
      res.status(400).json({ error: 'Channel not found or not text-based' });
      return;
    }

    const message = await channel.messages.fetch(messageId);
    await message.edit({
      content: 'React to RSVP!',
      embeds: [embed],
      components: renderRSVPButtons(eventId, closed),
    });

    res.json({ channelId, messageId });
  } catch (err) {
    logError('[update-event] Error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
}
