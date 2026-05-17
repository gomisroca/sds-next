'use client';

import { Calendar, FileText, LayoutDashboard, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS = {
  dashboard: LayoutDashboard,
  fileText: FileText,
  users: Users,
  calendar: Calendar,
  settings: Settings,
};

interface NavItemDef {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  exact?: boolean;
  soon?: boolean;
}

export default function AdminNavItem({ item }: { item: NavItemDef }) {
  const pathname = usePathname();

  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const Icon = ICONS[item.icon];

  if (item.soon) {
    return (
      <div className="flex cursor-not-allowed items-center gap-2.5 px-3 py-2 opacity-40">
        <Icon className="h-3.5 w-3.5 shrink-0 text-white/30" strokeWidth={1.5} />
        <span className="flex-1 text-xs font-light tracking-[0.15em] text-white/30 uppercase">{item.label}</span>
        <span className="text-[9px] font-light tracking-widest text-white/20 uppercase">Soon</span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 transition-colors duration-150 ${
        active ? 'bg-red-950/40 text-white/80' : 'text-white/35 hover:bg-white/[0.03] hover:text-white/60'
      }`}>
      <Icon
        className={`h-3.5 w-3.5 shrink-0 transition-colors ${active ? 'text-red-500/70' : 'text-white/25'}`}
        strokeWidth={1.5}
      />

      <span className="text-xs font-light tracking-[0.15em] uppercase">{item.label}</span>

      {active && <div className="ml-auto h-1 w-1 rounded-full bg-red-600/60" />}
    </Link>
  );
}
