import type { PrismaClient } from 'generated/prisma';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getEventAttendanceCounts, postEventToDiscord, renderEventEmbed, updateEventOnDiscord } from '@/utils/events';

// Interface describing the shape returned by renderEventEmbed
interface DiscordEmbed {
  title: string;
  description?: string;
  image?: { url: string };
  timestamp: string;
  footer: { text: string };
  fields: Array<{ name: string; value: string; inline?: boolean }>;
}

interface UpdateEventRequest {
  channelId: string;
  messageId: string;
  eventId: string;
  eventStartTime: string;
  embed: {
    title: string;
  };
}

// 1. Mock internal module structures used in dynamic imports
vi.mock('@/env', () => ({
  env: {
    BOT_URL: 'http://localhost:4000',
    BOT_SECRET: 'super-secret-key',
  },
}));

const mockGetSettings = vi.fn().mockReturnValue({} as Record<string, unknown>);
vi.mock('@/utils/settings', () => ({
  getSettings: (): Record<string, unknown> => mockGetSettings() as Record<string, unknown>,
}));

// 2. Global fetch mock configuration
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Events Utility Module', () => {
  beforeEach(function (this: void) {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00.000Z'));
  });

  afterEach(function (this: void) {
    vi.useRealTimers();
  });

  describe('getEventAttendanceCounts', () => {
    it('accurately shapes counts and isolates user name data lists', async () => {
      const databaseRows = [
        { status: 'ATTENDING' as const, user: { name: 'Alice' } },
        { status: 'ATTENDING' as const, user: { name: 'Bob' } },
        { status: 'MAYBE' as const, user: { name: 'Charlie' } },
        { status: 'NOT_ATTENDING' as const, user: { name: null } },
      ];

      const findManyMock = vi.fn().mockResolvedValue(databaseRows);
      const mockPrisma = {
        eventAttendance: {
          findMany: findManyMock,
        },
      } as unknown as PrismaClient;

      const result = await getEventAttendanceCounts('event-123', mockPrisma);

      expect(findManyMock).toHaveBeenCalledWith({
        where: { eventId: 'event-123' },
        select: { status: true, user: { select: { name: true } } },
      });

      expect(result).toEqual({
        attending: 2,
        maybe: 1,
        notAttending: 1,
        attendingNames: ['Alice', 'Bob'],
        maybeNames: ['Charlie'],
      });
    });

    it('enforces a strict cap of 20 names inside embed lists', async () => {
      const databaseRows = Array.from({ length: 25 }, (_, idx) => ({
        status: 'ATTENDING' as const,
        user: { name: `User_${idx}` },
      }));

      const mockPrisma = {
        eventAttendance: {
          findMany: vi.fn().mockResolvedValue(databaseRows),
        },
      } as unknown as PrismaClient;

      const result = await getEventAttendanceCounts('event-max-cap', mockPrisma);

      expect(result.attending).toBe(25);
      expect(result.attendingNames).toHaveLength(20);
      expect(result.attendingNames[0]).toBe('User_0');
    });
  });

  describe('renderEventEmbed', () => {
    const baseMockEvent = {
      id: 'evt_abc',
      name: 'Raid Night',
      description: 'Clearing the progression roster.',
      location: 'Discord VC 1',
      imageUrl: 'https://cdn.example.com/raid.png',
      startsAt: new Date('2026-06-16T19:00:00.000Z'),
      endsAt: new Date('2026-06-16T22:00:00.000Z'),
      createdByName: 'Guild Master',
      attendance: {
        attending: 2,
        maybe: 0,
        notAttending: 1,
        attendingNames: ['Alice', 'Bob'],
        maybeNames: [],
      },
    };

    it('transforms internal data into a valid Discord API shape', () => {
      // Cast the returned unknown object to our known safe structure
      const embed = renderEventEmbed(baseMockEvent) as unknown as DiscordEmbed;

      expect(embed.title).toBe('Raid Night');
      expect(embed.description).toBe('Clearing the progression roster.');
      expect(embed.image?.url).toBe('https://cdn.example.com/raid.png');
      expect(embed.timestamp).toBe('2026-06-15T12:00:00.000Z');
      expect(embed.footer.text).toContain('Created by Guild Master');
      expect(embed.fields[0]).toEqual({ name: '📅 Starts', value: '<t:1781636400:F>', inline: true });
    });

    it('gracefully appends placeholder syntax when attendee lists are empty or overflow', () => {
      const emptyAttendanceEvent = {
        ...baseMockEvent,
        endsAt: null,
        location: null,
        attendance: {
          attending: 0,
          maybe: 22,
          notAttending: 0,
          attendingNames: [],
          maybeNames: Array.from({ length: 20 }, (_, idx) => `User_${idx}`),
        },
      };

      const embed = renderEventEmbed(emptyAttendanceEvent) as unknown as DiscordEmbed;

      const attendingField = embed.fields.find((f) => f.name.includes('Attending (0)'));
      const maybeField = embed.fields.find((f) => f.name.includes('Maybe (22)'));

      expect(attendingField?.value).toBe('*No one yet*');
      expect(maybeField?.value).toContain('+2 more*');
    });
  });

  describe('postEventToDiscord', () => {
    const mockEventData = {
      id: 'evt_1',
      name: 'Weekly Dungeon Run',
      description: null,
      location: null,
      imageUrl: null,
      startsAt: new Date('2026-06-17T18:00:00.000Z'),
      endsAt: null,
      createdByName: null,
      attendance: { attending: 0, maybe: 0, notAttending: 0, attendingNames: [], maybeNames: [] },
    };

    it('returns null and outputs a warning log if target channel configs are absent', async () => {
      mockGetSettings.mockResolvedValueOnce({ eventChannelId: null });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => void 0);

      const result = await postEventToDiscord(mockEventData);

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('No eventChannelId configured'));
      warnSpy.mockRestore();
    });

    it('transmits standard request headers and body configurations on server success', async () => {
      mockGetSettings.mockResolvedValueOnce({ eventChannelId: 'discord-channel-999' });
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ channelId: 'discord-channel-999', messageId: 'msg-555' }),
      });

      const result = await postEventToDiscord(mockEventData);

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:4000/post-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bot-secret': 'super-secret-key',
        },
        body: expect.stringContaining('"channelId":"discord-channel-999"') as unknown as string,
      });

      expect(result).toEqual({ channelId: 'discord-channel-999', messageId: 'msg-555' });
    });

    it('catches and logs remote server errors gracefully without throwing', async () => {
      mockGetSettings.mockResolvedValueOnce({ eventChannelId: 'discord-channel-999' });
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid Embed Payload Structure',
      });
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

      const result = await postEventToDiscord(mockEventData);

      expect(result).toBeNull();
      expect(errorSpy).toHaveBeenCalledWith(
        '[postEventToDiscord] Bot returned',
        400,
        'Invalid Embed Payload Structure'
      );
      errorSpy.mockRestore();
    });
  });

  describe('updateEventOnDiscord', () => {
    const updateArgs = {
      channelId: 'chan-1',
      messageId: 'msg-1',
      eventId: 'evt-1',
      eventStartTime: new Date('2026-06-20T10:00:00.000Z'),
      embed: { title: 'Updated Title' },
    };

    it('posts updated transaction states successfully', async () => {
      fetchMock.mockResolvedValueOnce({ ok: true });

      await updateEventOnDiscord(updateArgs);

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];

      const body = JSON.parse(options.body as string) as UpdateEventRequest;

      expect(body).toEqual({
        channelId: 'chan-1',
        messageId: 'msg-1',
        eventId: 'evt-1',
        embed: { title: 'Updated Title' },
        eventStartTime: '2026-06-20T10:00:00.000Z',
      });
    });

    it('intercepts runtime connection exceptions gracefully', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Connection timed out'));
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => void 0);

      await expect(updateEventOnDiscord(updateArgs)).resolves.not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith('[updateEventOnDiscord] Network error:', expect.any(Error));
      errorSpy.mockRestore();
    });
  });
});
