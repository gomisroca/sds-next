import { ExternalLink, Shield, Swords, Users } from 'lucide-react';
import Link from 'next/link';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { db } from '@/server/db';
import { getSettings } from '@/utils/settings';

async function getMemberCount() {
  return db.user.count({ where: { role: { notIn: ['GUEST'] } } });
}

const WHAT_WE_OFFER = [
  {
    icon: Swords,
    title: 'All content, all skill levels',
    body: 'From first-time dungeon runs to savage progression groups. We make space for everyone without pressure or gatekeeping.',
  },
  {
    icon: Users,
    title: 'A real community',
    body: 'Regular social events, FC nights, and an active Discord where people actually talk. We have been going for years and plan to keep going.',
  },
  {
    icon: Shield,
    title: 'A safe, friendly space',
    body: 'We have a simple rule: be kind. No elitism, no drama. Officers are here to help, not police.',
  },
];

export default async function JoinPage() {
  const [settings, memberCount] = await Promise.all([getSettings(), getMemberCount()]);

  const hasInvite = !!settings.discordInvite;

  return (
    <main
      className="min-h-screen bg-[#060404] pt-14 text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)' }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,50,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,50,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-4 text-xs font-light tracking-[0.4em] text-red-800/60 uppercase">{settings.subtitle}</p>
          <h1 className="mb-3 text-4xl font-extralight tracking-[0.1em] text-white/85 uppercase md:text-5xl">
            Join the Den
          </h1>
          <p className="mb-8 text-base font-light text-white/35 italic">
            A home for every kind of adventurer in Eorzea
          </p>
          <OrnamentalRule />
        </div>

        {/* FC intro */}
        <div className="mb-14 text-center">
          <p className="mx-auto max-w-xl text-base leading-relaxed font-light text-white/55">{settings.welcomeText}</p>
          <p className="mt-6 text-sm font-light text-white/30">
            {memberCount} member{memberCount !== 1 ? 's' : ''} and counting.
          </p>
        </div>

        {/* What we offer */}
        <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {WHAT_WE_OFFER.map((item) => (
            <div key={item.title} className="relative border border-red-900/20 bg-white/[0.02] p-6">
              <div className="absolute top-0 left-0 h-4 w-4 border-t border-l border-red-700/30" />
              <item.icon className="mb-4 h-5 w-5 text-red-700/50" strokeWidth={1.5} />
              <h3 className="mb-2 text-xs font-light tracking-widest text-red-400/80 uppercase">{item.title}</h3>
              <p className="text-sm leading-relaxed font-light text-white/45">{item.body}</p>
            </div>
          ))}
        </div>

        <OrnamentalRule className="mb-14" />

        {/* CTA */}
        <div className="text-center">
          <h2 className="mb-3 text-2xl font-extralight tracking-wide text-white/75 uppercase">Ready to join?</h2>
          <p className="mb-8 text-sm font-light text-white/40">
            {hasInvite
              ? 'Join our Discord server and introduce yourself. An officer will get you sorted.'
              : 'Our Discord invite link is coming soon. Check back shortly or ask a member in-game.'}
          </p>

          {hasInvite ? (
            <a
              href={settings.discordInvite!}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-red-700/50 bg-red-950/25 px-10 py-4 text-sm font-light tracking-[0.25em] text-red-300/90 uppercase transition-all duration-300 hover:border-red-600/70 hover:bg-red-900/35 hover:text-red-200">
              {/* Discord mark */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.02.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
              Join our Discord
              <ExternalLink
                className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-80"
                strokeWidth={1.5}
              />
            </a>
          ) : (
            <div className="inline-flex items-center gap-3 border border-red-900/20 px-10 py-4 text-sm font-light tracking-[0.25em] text-white/20 uppercase">
              Discord invite coming soon
            </div>
          )}

          <p className="mt-6 text-xs font-light text-white/20">
            Already a member?{' '}
            <Link
              href="/api/auth/signin"
              className="text-red-800/60 underline-offset-2 transition-colors hover:text-red-700/80 hover:underline">
              Sign in with Discord
            </Link>{' '}
            to access your profile and RSVP to events.
          </p>
        </div>
      </div>
    </main>
  );
}
