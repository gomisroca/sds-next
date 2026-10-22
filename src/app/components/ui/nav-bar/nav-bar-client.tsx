'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/members', label: 'Members' },
];

// ── Miniature sigil ───────────────────────────────────────────────────────────
function NavSigil() {
  return (
    <svg viewBox="0 0 40 40" className="h-7 w-7 shrink-0" aria-hidden>
      <defs>
        <filter id="nav-glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="18" stroke="#8b1a00" strokeWidth="0.75" fill="none" strokeDasharray="4 2" />
      <g filter="url(#nav-glow)" stroke="#cc2200" strokeLinecap="round" fill="none">
        <path
          d="M20 11 C26 11 31 14 32 18 C33 22 30 26 26 27.5 C22 29 17 28 14 25 C11 22 11.5 17.5 14.5 15 C16.5 13.5 19 13 21 14 C23.5 15.5 24.5 18.5 23 21 C21.5 22.5 18.5 22.5 17 21 C16 20 16.5 17.5 18 17"
          strokeWidth="1.5"
        />
        <path d="M32 18 C34 17 35 15 34 12.5 C33 10.5 31.5 10 30.5 10" strokeWidth="1" />
        <path d="M20 11 C19 9.5 17.5 8.5 17 7.5 C18 6.5 19.5 7 20.5 8" strokeWidth="1.2" />
        <circle cx="18.2" cy="8.5" r="1.2" fill="#cc2200" stroke="none" />
      </g>
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return <circle key={i} cx={20 + 14.5 * Math.cos(rad)} cy={20 + 14.5 * Math.sin(rad)} r="1" fill="#8b1a00" />;
      })}
    </svg>
  );
}

// ── Hamburger ─────────────────────────────────────────────────────────────────
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      className="relative flex h-9 w-9 flex-col items-center justify-center overflow-hidden md:hidden">
      <motion.span
        className="absolute h-px w-5 bg-white/50"
        animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
        transition={{ duration: 0.22 }}
      />
      <motion.span
        className="absolute h-px w-5 bg-white/50"
        animate={open ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.18 }}
      />
      <motion.span
        className="absolute h-px w-5 bg-white/50"
        animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
        transition={{ duration: 0.22 }}
      />
    </button>
  );
}

// ── Nav bar ───────────────────────────────────────────────────────────────────

interface NavBarProps {
  fcName?: string;
  subtitle?: string;
}

export default function NavBar({ fcName = 'Sleeping Dragons', subtitle = 'EU · Light · Phoenix' }: NavBarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed top-0 right-0 left-0 z-50"
        style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(4,1,1,0.93) 0%, rgba(6,2,2,0.82) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
        <div
          className="absolute right-0 bottom-0 left-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(150,25,0,0.45) 25%, rgba(210,45,0,0.65) 50%, rgba(150,25,0,0.45) 75%, transparent 100%)',
          }}
        />

        <nav className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <NavSigil />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-extralight tracking-[0.18em] text-white/80 uppercase transition-colors duration-300 group-hover:text-white/95">
                {fcName}
              </span>
              <span className="text-[10px] font-light tracking-[0.25em] text-red-600/80 uppercase">{subtitle}</span>
            </div>
          </Link>

          {/* Desktop links + auth */}
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className="group relative px-4 py-1.5">
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute right-4 bottom-0 left-4 h-px bg-red-700"
                      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    />
                  )}
                  <span
                    className={`text-xs font-light tracking-[0.25em] uppercase transition-colors duration-200 ${
                      active ? 'text-white/90' : 'text-white/80 group-hover:text-white/90'
                    }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {/* Join */}
            <div className="mx-3 h-3.5 w-px bg-red-900/40" />
            <Link href="/join">
              <motion.span
                className="inline-block border border-red-800/50 bg-red-950/25 px-5 py-1.5 text-xs font-light tracking-[0.25em] text-red-400 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}>
                Join
              </motion.span>
            </Link>
          </div>

          {/* Mobile: auth + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <Hamburger open={menuOpen} onClick={() => setMenuOpen((v) => !v)} />
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-14 right-0 left-0 z-40 border-b border-red-900/25 px-6 py-8"
              style={{
                background: 'rgba(5,1,1,0.97)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif",
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex flex-col gap-1">
                {LINKS.map((link, i) => {
                  const active = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.2 }}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-4 py-3 text-sm font-light tracking-[0.25em] uppercase transition-colors duration-200 ${
                          active ? 'text-white/90' : 'text-white/60 hover:text-white/90'
                        }`}>
                        <span
                          className={`h-px w-4 transition-colors duration-200 ${
                            active ? 'bg-red-700' : 'bg-red-900/40'
                          }`}
                        />
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="my-3 h-px bg-red-900/20" />

                {/* Join Us */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: LINKS.length * 0.06, duration: 0.2 }}>
                  <Link
                    href="/join"
                    className="inline-block border border-red-800/50 bg-red-950/25 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-400 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300">
                    Join
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
