'use client';

import OrnamentalRule from './ornamental-rule';

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-red-950/40 py-10 text-center">
      <OrnamentalRule />
      <p className="mt-6 text-xs font-light tracking-[0.3em] text-white/20 uppercase">
        Sleeping Dragons · Light · Phoenix
      </p>
    </footer>
  );
}
