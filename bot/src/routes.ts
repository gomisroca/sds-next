import type { Client, TextChannel } from 'discord.js';
import type { Express, Request, Response } from 'express';

import { type DiscordEmbed, renderRSVPButtons } from './embed.js';

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

export function registerRoutes(app: Express, client: Client, botSecret: string): void {
  // ── Health check ────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      bot: client.isReady() ? 'ready' : 'not ready',
      tag: client.user?.tag ?? null,
    });
  });

  // ── POST /post-event ────────────────────────────────────────────────────────
  // Called by Next.js when a new event is published.
  // Posts a new message in the specified channel and returns the message ID.
  app.post('/post-event', async (req: Request, res: Response) => {
    if (!checkSecret(req, res, botSecret)) return;

    const body = req.body as PostEventBody;
    const { channelId, embed, eventId, eventStartTime } = body;

    if (!channelId || !embed || !eventId || !eventStartTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const closed = isClosed(eventStartTime);

    if (closed) {
      embed.footer = { text: '⛔ RSVPs are closed' };
    }

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

      // eslint-disable-next-line no-console
      console.log(`[post-event] Posted event ${eventId} → message ${message.id}`);

      res.json({
        channelId: message.channelId,
        messageId: message.id,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[post-event] Error:', err);
      res.status(500).json({ error: 'Failed to post event' });
    }
  });

  // ── POST /update-event ──────────────────────────────────────────────────────
  // Called by Next.js after an RSVP changes to update the embed.
  app.post('/update-event', async (req: Request, res: Response) => {
    if (!checkSecret(req, res, botSecret)) return;

    const body = req.body as UpdateEventBody;
    const { channelId, messageId, embed, eventId, eventStartTime } = body;

    if (!channelId || !messageId || !embed || !eventId || !eventStartTime) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const closed = isClosed(eventStartTime);

    if (closed) {
      embed.footer = { text: '⛔ RSVPs are closed' };
    }

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

      // eslint-disable-next-line no-console
      console.log(`[update-event] Updated event ${eventId} → message ${messageId}`);

      res.json({ channelId, messageId });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[update-event] Error:', err);
      res.status(500).json({ error: 'Failed to update event' });
    }
  });
}
