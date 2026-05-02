import '@/styles/globals.css';

import { Provider as JotaiProvider } from 'jotai';
import { type Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
// Providers
import { Toaster } from 'sileo';

import Footer from './components/ui/footer';
import NavBar from './components/ui/nav-bar';

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

export default function RootLayout({
  children,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode }>) {
  return (
    <html lang="en" className={worksans.className} suppressHydrationWarning>
      <body className="text-zinc-800 dark:text-zinc-200">
        <Toaster
          position="top-center"
          options={{
            styles: { description: 'font-medium flex justify-center' },
          }}
        />
        <JotaiProvider>
          <div id="modal-root" />
          {modal}
          <NavBar />
          {children}
          <Footer />
        </JotaiProvider>
      </body>
    </html>
  );
}
