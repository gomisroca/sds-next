import { db } from '@/server/db';

export interface SiteSettings {
  fcName: string;
  subtitle: string;
  welcomeTitle: string;
  welcomeText: string;
  discordInvite: string | null;
  eventChannelId: string | null;
  showLatestPost: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  fcName: 'Sleeping Dragons',
  subtitle: 'EU · Light · Phoenix',
  welcomeTitle: 'Welcome, Warrior of Light',
  welcomeText:
    "Sleeping Dragons is a friendly home for adventurers of all kinds - whether you're here to clear savage tier, tend your garden, or simply share a glass of Ul'dahn wine by the hearth. Pull up a chair.",
  discordInvite: null,
  eventChannelId: null,
  showLatestPost: false,
};

/**
 * Fetch FC settings, falling back to defaults if the row doesn't exist yet.
 * Safe to call from any server component - cached per-request by Next.js.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const row = await db.fCSettings.findUnique({ where: { id: 'default' } });
    if (!row) return DEFAULT_SETTINGS;
    return {
      fcName: row.fcName,
      subtitle: row.subtitle,
      welcomeTitle: row.welcomeTitle,
      welcomeText: row.welcomeText,
      discordInvite: row.discordInvite,
      eventChannelId: row.eventChannelId,
      showLatestPost: row.showLatestPost,
    };
  } catch {
    // Gracefully fall back to defaults if DB is unavailable
    return DEFAULT_SETTINGS;
  }
}
