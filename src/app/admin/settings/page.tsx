import { AdminPageHeader } from '@/app/components/ui/page-header';
import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { DEFAULT_SETTINGS } from '@/utils/settings';

import SettingsForm from './settings-form';

export const dynamic = 'force-dynamic';

async function getSettings() {
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
}

export default async function AdminSettingsPage() {
  const [session, settings] = await Promise.all([auth(), getSettings()]);
  const isLeader = session?.user?.role === 'LEADER';

  return (
    <>
      <AdminPageHeader
        title="Settings"
        subtitle={`${
          isLeader
            ? 'Changes take effect on the next page load.'
            : 'You can view settings but only leaders can make changes.'
        }`}
      />

      <SettingsForm initialSettings={settings} isLeader={isLeader} />
    </>
  );
}
