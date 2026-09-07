import Link from 'next/link';

export default function AdminActionButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-1 flex shrink-0 items-center gap-2 border border-red-800/50 bg-red-950/20 px-5 py-2 text-xs font-light tracking-[0.2em] text-red-400/85 uppercase transition-all hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300">
      {children}
    </Link>
  );
}
