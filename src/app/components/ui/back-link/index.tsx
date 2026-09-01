import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group mb-10 inline-flex items-center gap-2 text-xs font-light tracking-[0.25em] text-white/60 uppercase transition-colors hover:text-white/90">
      <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
      {children}
    </Link>
  );
}
