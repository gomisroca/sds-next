import '@/styles/globals.css';

import { NextSSRPlugin as UploadThingSSRPlugin } from '@uploadthing/react/next-ssr-plugin';
import { Provider as JotaiProvider } from 'jotai';
import { type Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
// Providers
import { Toaster } from 'sileo';
import { extractRouterConfig } from 'uploadthing/server';

import { UploadThingRouter } from '@/app/api/uploadthing/core';
import { auth } from '@/server/auth';

import Footer from './components/ui/footer';
import NavBarServer from './components/ui/nav-bar-server';

export const metadata: Metadata = {
  title: 'SleepingDragons',
  description: 'Free Company in Phoenix, Light',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  openGraph: {
    title: 'SleepingDragons',
    description: 'Free Company in Phoenix, Light',
    url: 'https://xiv-raider.vercel.app',
    siteName: 'SleepingDragons',
    images: [
      {
        url: '/og.png',
        width: 64,
        height: 64,
        alt: 'SleepingDragons',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SleepingDragons',
    description: 'Free Company in Phoenix, Light',
    images: [
      {
        url: '/og.png',
        width: 64,
        height: 64,
        alt: 'SleepingDragons',
      },
    ],
  },
};

const worksans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
});

export default async function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" className={worksans.className} suppressHydrationWarning>
      <body className="text-zinc-800 dark:text-zinc-200">
        <Toaster
          position="top-center"
          options={{
            styles: { description: 'font-medium flex justify-center' },
          }}
        />
        <SessionProvider session={session}>
          <JotaiProvider>
            <UploadThingSSRPlugin routerConfig={extractRouterConfig(UploadThingRouter)} />
            <div id="modal-root" />
            {modal}
            <NavBarServer />
            {children}
            <Footer />
          </JotaiProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
