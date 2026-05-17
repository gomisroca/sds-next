import { Calendar, FileText, Settings, Users } from 'lucide-react';
import Link from 'next/link';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';

const CARDS = [
  {
    href: '/admin/events',
    icon: Calendar,
    title: 'Events',
    description: 'View and manage all events, including drafts.',
    available: true,
  },
  {
    href: '/admin/templates',
    icon: FileText,
    title: 'Event Templates',
    description: 'Create and manage reusable event templates for the FC.',
    available: true,
  },
  {
    href: '/admin/members',
    icon: Users,
    title: 'Members',
    description: 'Manage member roles, profiles, and access.',
    available: false,
  },
  {
    href: '/admin/settings',
    icon: Settings,
    title: 'Settings',
    description: 'FC settings, Discord integration, and configuration.',
    available: false,
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-10">
        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Sleeping Dragons</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase md:text-4xl">Admin Panel</h1>
        <OrnamentalRule className="max-w-xs" />
        <p className="mt-6 text-sm font-light text-white/35">Officer tools for managing the Free Company.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const inner = (
            <div
              className={`group relative flex flex-col gap-4 border p-6 transition-all duration-200 ${
                card.available
                  ? 'cursor-pointer border-red-900/25 bg-white/[0.02] hover:border-red-800/40 hover:bg-white/[0.04]'
                  : 'cursor-not-allowed border-red-900/15 bg-white/[0.01] opacity-50'
              }`}>
              <div className="absolute top-0 left-0 h-5 w-5 border-t border-l border-red-700/30" />
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 ${card.available ? 'text-red-700/60' : 'text-white/20'}`}
                  strokeWidth={1.5}
                />
                <h2 className="text-sm font-light tracking-[0.1em] text-white/70 uppercase">{card.title}</h2>
                {!card.available && (
                  <span className="ml-auto text-[9px] font-light tracking-widest text-white/20 uppercase">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed font-light text-white/35">{card.description}</p>
            </div>
          );

          return card.available ? (
            <Link key={card.href} href={card.href}>
              {inner}
            </Link>
          ) : (
            <div key={card.href}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
