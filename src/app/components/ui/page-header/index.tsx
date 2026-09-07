import OrnamentalRule from '../ornamental-rule';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow = 'Sleeping Dragons',
  title,
  subtitle,
  children,
  className = 'mb-12',
}: PageHeaderProps) {
  return (
    <div className={className}>
      {eyebrow && <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/70 uppercase">{eyebrow}</p>}
      <h1 className="mb-6 text-4xl font-extralight tracking-[0.1em] text-white/90 uppercase md:text-5xl">{title}</h1>
      <OrnamentalRule className="max-w-xs" />
      {subtitle && <p className="mt-6 max-w-lg text-sm leading-relaxed font-light text-white/60">{subtitle}</p>}
      {children}
    </div>
  );
}

/**
 * AdminPageHeader, used inside the admin panel (no eyebrow, consistent max-width).
 * Optionally accepts an action slot (e.g. a "New Event" button).
 */
export function AdminPageHeader({
  breadcrumb,
  title,
  subtitle,
  action,
  className = 'mb-10',
}: {
  breadcrumb?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        {breadcrumb && (
          <p className="mb-3 text-xs font-light tracking-[0.35em] text-red-800/60 uppercase">{breadcrumb}</p>
        )}
        <h1 className="mb-6 text-3xl font-extralight tracking-wide text-white/90 uppercase">{title}</h1>
        <OrnamentalRule className="max-w-xs" />
        {subtitle && <p className="mt-6 text-sm font-light text-white/60">{subtitle}</p>}
      </div>
      {action && <div className="mt-1 shrink-0">{action}</div>}
    </div>
  );
}
