import { getSettings } from '@/utils/settings';

import NavBar from './nav-bar-client';

export default async function NavBarServer() {
  const settings = await getSettings();
  return <NavBar fcName={settings.fcName} subtitle={settings.subtitle} />;
}
