'use client';

import '@cookieyes/react/styles.css';

import { CookieBanner, CookiePreferences, initCookieYes } from '@cookieyes/nextjs';

initCookieYes({
  mode: 'cookie-only',
  regulation: 'GDPR',
  colorScheme: 'dark',
});

export function CookieYesRoot() {
  return (
    <>
      <CookieBanner />
      <CookiePreferences />
    </>
  );
}
