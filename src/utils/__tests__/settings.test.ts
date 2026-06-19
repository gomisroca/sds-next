import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_SETTINGS, getSettings } from '@/utils/settings';

// 1. Setup individual named mock tracking functions for Prisma
const findUniqueMock = vi.hoisted(() => vi.fn());

// 2. Mock the central application database module layer
vi.mock('@/server/db', () => ({
  db: {
    fCSettings: {
      findUnique: findUniqueMock,
    },
  },
}));

describe('Settings Utility Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('transforms and returns custom configuration entries on server success', async () => {
    const mockDatabaseRow = {
      id: 'default',
      fcName: 'Chocobo Knights',
      subtitle: 'EU · Chaos · Cerberus',
      welcomeTitle: 'Greetings Adventurer',
      welcomeText: 'A distinct guild house welcoming message variant text.',
      discordInvite: 'https://discord.gg/chocoboknights',
      eventChannelId: '123456789012345678',
      showLatestPost: true,
      updatedAt: new Date(),
    };

    // Use explicit unknown-to-target casting to assert the response structure
    findUniqueMock.mockResolvedValueOnce(mockDatabaseRow);

    const result = await getSettings();

    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: 'default' },
    });

    // Validates object matches the mapped interface exactly, removing metadata like 'id' or 'updatedAt'
    expect(result).toEqual({
      fcName: 'Chocobo Knights',
      subtitle: 'EU · Chaos · Cerberus',
      welcomeTitle: 'Greetings Adventurer',
      welcomeText: 'A distinct guild house welcoming message variant text.',
      discordInvite: 'https://discord.gg/chocoboknights',
      eventChannelId: '123456789012345678',
      showLatestPost: true,
    });
  });

  it('safely returns the DEFAULT_SETTINGS if no configuration row exists in the database', async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const result = await getSettings();

    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: 'default' } });
    expect(result).toEqual(DEFAULT_SETTINGS);
  });

  it('gracefully intercepts database connection runtime errors and falls back to default options', async () => {
    findUniqueMock.mockRejectedValueOnce(new Error('Database connection timed out or is unavailable'));

    // Verify the asynchronous utility handles exceptions cleanly without throwing upstream
    const result = await getSettings();

    expect(findUniqueMock).toHaveBeenCalledWith({ where: { id: 'default' } });
    expect(result).toEqual(DEFAULT_SETTINGS);
  });
});
