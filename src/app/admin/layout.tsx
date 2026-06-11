import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/server/auth';
import { db } from '@/server/db';

import AdminNavItem from './admin-nav-item';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/events', label: 'Events', icon: 'calendar' },
  { href: '/admin/templates', label: 'Templates', icon: 'fileText' },
  { href: '/admin/blog', label: 'Blog Posts', icon: 'news' },
  { href: '/admin/members', label: 'Members', icon: 'users' },
  { href: '/admin/settings', label: 'Settings', icon: 'settings' },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
      className="min-h-screen bg-[#060404] text-white"
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

      <div className="relative z-10 flex min-h-screen pt-14">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden w-56 shrink-0 border-r border-red-900/20 md:block">
          <div className="sticky top-14 flex flex-col gap-1 p-4 pt-8">
            <div className="mb-4 px-3">
              <p className="text-[10px] font-light tracking-[0.3em] text-red-800/60 uppercase">Admin Panel</p>
              <p className="mt-0.5 text-xs font-light text-white/25">{user.name ?? 'Officer'}</p>
            </div>

            <div className="mb-3 h-px bg-red-900/20" />

            {NAV_ITEMS.map((item) => (
              <AdminNavItem key={item.href} item={item} />
            ))}

            <div className="mt-8 border-t border-red-900/15 pt-8">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 text-xs font-light tracking-[0.2em] text-white/20 uppercase transition-colors hover:text-white/40">
                ← Back to site
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Mobile admin bar ── */}
        <div
          className="fixed top-14 right-0 left-0 z-30 flex items-center gap-3 border-b border-red-900/20 bg-[#060404]/95 px-4 py-2 md:hidden"
          style={{ backdropFilter: 'blur(8px)' }}>
          <p className="shrink-0 text-xs font-light tracking-[0.25em] text-red-800/60 uppercase">Admin</p>
          <div className="h-3 w-px bg-red-900/30" />
          <div className="flex gap-4 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 text-xs font-light tracking-[0.2em] text-white/40 uppercase transition-colors hover:text-white/70">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 px-6 py-12 pt-16 md:pt-12">{children}</main>
      </div>
    </div>
  );
}
