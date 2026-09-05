import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function BackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="group mb-10 inline-flex items-center gap-2 text-xs font-light tracking-[0.25em] text-white/30 uppercase transition-colors duration-200 hover:text-white/60">
      <ArrowLeft className="h-3 w-3 transition-transform duration-200 group-hover:-translate-x-0.5" strokeWidth={1.5} />
      {label}
    </Link>
  );
}
