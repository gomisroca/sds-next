import { EventStatus } from 'generated/prisma';

import { db } from '@/server/db';
import { getSettings } from '@/utils/settings';

import { FeaturedEventCard } from './featured-card-event';
import HomeHero from './home-hero';

export const revalidate = 60;

async function getNextEvent() {
  return db.event.findFirst({
    where: {
      status: EventStatus.PUBLISHED,
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      imageUrl: true,
      startsAt: true,
      endsAt: true,
      _count: { select: { attendances: true } },
    },
  });
}

// ── Info cards ────────────────────────────────────────────────────────────────
const INFO = [
  {
    icon: '⚔',
    title: 'Adventure Together',
    body: "From casual levelling runs to savage raids, we do it as a group. No elitism, no pressure - just a crew that has each other's backs in every corner of Eorzea.",
  },
  {
    icon: '🏠',
    title: 'A Place to Call Home',
    body: 'Our estate in the Goblet is always open. Pop in to use the workshop, hang out in the garden, or just have somewhere warm to log in to at the end of a long day.',
  },
  {
    icon: '🐉',
    title: 'All Are Welcome',
    body: "Brand new to the game or a veteran of a dozen Ultimate clears - if you're kind, curious, and up for a good time, you already fit in here.",
  },
];

function InfoCards() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {INFO.map((card) => (
        <div
          key={card.title}
          className="group relative overflow-hidden rounded-sm border border-red-900/25 bg-white/[0.03] p-7 backdrop-blur-sm transition-colors duration-200 hover:border-red-800/40 hover:bg-white/[0.05]">
          <div className="absolute top-0 left-0 h-5 w-5 border-t border-l border-red-700/40" />
          <div className="absolute right-0 bottom-0 h-5 w-5 border-r border-b border-red-700/40" />
          <div className="relative">
            <span className="mb-4 block text-2xl">{card.icon}</span>
            <h3 className="mb-3 text-xs font-light tracking-widest text-red-400/90 uppercase">{card.title}</h3>
            <p className="text-sm leading-relaxed font-light text-white/55">{card.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Welcome section ───────────────────────────────────────────────────────────
async function WelcomeSection() {
  const [event, settings] = await Promise.all([getNextEvent(), getSettings()]);

  return (
    <section id="welcome" className="relative z-20 flex min-h-screen flex-col justify-center px-6 py-24">
      <div className="mx-auto w-full max-w-5xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-2xl font-light tracking-[0.15em] text-white/80 uppercase md:text-3xl">
            {settings.welcomeTitle}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed font-light text-white/45">{settings.welcomeText}</p>
        </div>

        {/* Featured event - real data */}
        <FeaturedEventCard event={event} />

        {/* Info cards */}
        <InfoCards />
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function Home() {
  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#060404] text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      {/* Client island - hero, embers, parallax */}
      <HomeHero />
      {/* Server - fetches next event from DB */}
      <WelcomeSection />
    </main>
  );
}
