import { CalendarDays, FileText, Newspaper, Users } from 'lucide-react';
import Link from 'next/link';

import OrnamentalRule from '@/app/components/ui/ornamental-rule';
import { db } from '@/server/db';

async function getStats() {
  const [memberCount, templateCount, eventCount] = await Promise.all([
    db.user.count({ where: { role: { not: 'GUEST' } } }),
    db.event.count({ where: { isTemplate: true } }),
    db.event.count({ where: { isTemplate: false, status: 'PUBLISHED', startsAt: { gte: new Date() } } }),
  ]);
  return { memberCount, templateCount, eventCount };
}

export default async function AdminPage() {
  const stats = await getStats();

  return (
    <>
      <div className="mb-10">
        <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">Sleeping Dragons</p>
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/85 uppercase">Admin</h1>
        <OrnamentalRule className="max-w-xs" />
      </div>

      {/* Stats row */}
      <div className="mb-10 grid grid-cols-3 gap-4">
        {[
          { label: 'Members', value: stats.memberCount },
          { label: 'Upcoming Events', value: stats.eventCount },
          { label: 'Templates', value: stats.templateCount },
        ].map((stat) => (
          <div key={stat.label} className="border border-red-900/20 bg-white/[0.02] p-5 text-center">
            <p className="text-3xl font-extralight text-white/70">{stat.value}</p>
            <p className="mt-1 text-xs font-light tracking-widest text-white/25 uppercase">{stat.label}</p>
          </div>
        ))}
      </div>

      <OrnamentalRule />

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminQuickLink
          href="/admin/templates"
          icon={FileText}
          title="Event Templates"
          description="Manage reusable event templates for quick event creation."
        />
        <AdminQuickLink
          href="/admin/events"
          icon={CalendarDays}
          title="Manage Events"
          description="View all events — drafts, published, and cancelled."
        />
        <AdminQuickLink
          href="/events/new"
          icon={FileText}
          title="New Event"
          description="Create a new event or use an existing template."
        />
        <AdminQuickLink
          href="/admin/blog"
          icon={Newspaper}
          title="Manage Blog Posts"
          description="View all blog posts — drafts and published."
        />
        <AdminQuickLink href="/blog/new" icon={Newspaper} title="New Blog Post" description="Create a new blog post." />
        <AdminQuickLink
          href="/profile/new"
          icon={Users}
          title="New Profile"
          description="Create a profile for a member who doesn't have one yet."
          disabled
          soon
        />
        <AdminQuickLink
          href="/admin/members"
          icon={Users}
          title="Manage Members"
          description="View all users, set roles, and track profile and Discord link status."
        />
      </div>
    </>
  );
}

function AdminQuickLink({
  href,
  icon: Icon,
  title,
  description,
  disabled,
  soon,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  disabled?: boolean;
  soon?: boolean;
}) {
  const inner = (
    <div
      className={`group flex items-start gap-4 border border-red-900/20 bg-white/[0.02] p-5 transition-all duration-200 ${
        disabled ? 'cursor-not-allowed opacity-40' : 'hover:border-red-800/40 hover:bg-white/[0.04]'
      }`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-red-700/50" strokeWidth={1.5} />
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-light text-white/70">{title}</p>
          {soon && <span className="text-[10px] font-light tracking-widest text-white/20 uppercase">Soon</span>}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed font-light text-white/30">{description}</p>
      </div>
    </div>
  );

  if (disabled) return <div>{inner}</div>;
  return <Link href={href}>{inner}</Link>;
}
