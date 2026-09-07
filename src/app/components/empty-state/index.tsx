import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <Icon className="h-8 w-8 text-red-900/30" strokeWidth={1} />
      <p className="text-sm font-light tracking-widest text-white/25 uppercase">{title}</p>
      {subtitle && <p className="text-xs font-light text-white/15">{subtitle}</p>}
    </div>
  );
}
