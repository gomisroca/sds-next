import '@/styles/globals.css';

// Libraries
import dynamic from 'next/dynamic';
import { type Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
// Providers
import { ThemeProvider } from 'next-themes';
import { Provider as JotaiProvider } from 'jotai';
import ThemeButton from './components/theme-button';

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
        <ThemeProvider attribute="class" defaultTheme="dark">
          <JotaiProvider>
            <div id="modal-root" />
            {modal}
            <header>
              <ThemeButton />
            </header>
            {children}
            {/* <Footer /> */}
          </JotaiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
