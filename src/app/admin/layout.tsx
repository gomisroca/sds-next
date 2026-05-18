import { Shield } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

import AdminNavItem from './admin-nav-item';

export const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/events', label: 'Events', icon: 'calendar' },
  { href: '/admin/templates', label: 'Event Templates', icon: 'fileText' },
  { href: '/admin/members', label: 'Members', icon: 'users' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings', soon: true },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/signin');

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });

  if (!user || (user.role !== 'OFFICER' && user.role !== 'LEADER')) {
    redirect('/');
  }

  return (
    <div
      className="flex min-h-screen bg-[#060404] text-white"
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

      {/* Sidebar */}
      <aside className="fixed top-14 bottom-0 left-0 z-30 flex w-56 flex-col border-r border-red-900/20 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 border-b border-red-900/20 px-5 py-4">
          <Shield className="h-3.5 w-3.5 shrink-0 text-red-700/60" strokeWidth={1.5} />
          <div className="min-w-0">
            <p className="text-xs font-light tracking-[0.2em] text-white/50 uppercase">Admin</p>
            <p className="truncate text-[10px] font-light text-white/25">{user.name ?? 'Officer'}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {NAV_ITEMS.map((item) => (
            <AdminNavItem key={item.href} item={item} />
          ))}
        </nav>

        <div className="border-t border-red-900/20 p-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-light tracking-[0.15em] text-white/25 uppercase transition-colors hover:text-white/50">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="relative z-10 ml-56 flex-1 pt-14">
        <div className="mx-auto max-w-5xl px-8 py-12">{children}</div>
      </main>
    </div>
  );
}
