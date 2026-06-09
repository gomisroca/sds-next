import OrnamentalRule from '@/app/components/ui/ornamental-rule';
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
      <div className="mb-10">
        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Admin</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Settings</h1>
        <OrnamentalRule className="max-w-xs" />
        <p className="mt-6 text-sm font-light text-white/35">
          {isLeader
            ? 'Changes take effect on the next page load.'
            : 'You can view settings but only leaders can make changes.'}
        </p>
      </div>

      <SettingsForm initialSettings={settings} isLeader={isLeader} />
    </>
  );
}
