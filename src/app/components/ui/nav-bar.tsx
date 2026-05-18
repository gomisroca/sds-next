'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
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

// ── Auth button ───────────────────────────────────────────────────────────────
function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-6 w-20 animate-pulse rounded-sm bg-red-900/20" />;
  }

  if (session?.user) {
    return (
      <motion.button
        onClick={() => signOut()}
        className="group flex cursor-pointer items-center gap-2 border border-transparent px-2 py-1 text-xs font-light tracking-[0.15em] text-white/40 uppercase transition-all duration-200 hover:border-red-900/30 hover:text-white/60"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}>
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? 'Avatar'}
            width={22}
            height={22}
            className="rounded-full ring-1 ring-red-900/40"
          />
        ) : (
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-red-950/60 text-[10px] text-red-400/80 ring-1 ring-red-900/40">
            {session.user.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        )}
        <span className="hidden sm:inline">{session.user.name?.split(' ')[0]}</span>
        <span className="text-red-900/50 transition-colors group-hover:text-red-700/70">·</span>
        <span className="text-white/25 transition-colors group-hover:text-white/50">Sign out</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={() => signIn('discord')}
      className="flex cursor-pointer items-center gap-2 border border-red-800/50 bg-red-950/20 px-2 py-1.5 text-xs font-light tracking-[0.25em] text-red-400/85 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}>
      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.02.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
      Sign in
    </motion.button>
  );
}

// ── Mobile auth row ───────────────────────────────────────────────────────────
function MobileAuthRow() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (session?.user) {
    return (
      <div className="mt-1 flex items-center justify-between border-t border-red-900/20 pt-4">
        <div className="flex items-center gap-2.5">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name ?? 'Avatar'}
              width={24}
              height={24}
              className="rounded-full ring-1 ring-red-900/40"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-950/60 text-[10px] text-red-400/80 ring-1 ring-red-900/40">
              {session.user.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          )}
          <span className="text-sm font-light tracking-wide text-white/50">{session.user.name}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs font-light tracking-[0.2em] text-white/25 uppercase transition-colors hover:text-white/50">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mt-1 border-t border-red-900/20 pt-4">
      <button
        onClick={() => signIn('discord')}
        className="flex items-center gap-2 text-xs font-light tracking-[0.25em] text-red-400/70 uppercase transition-colors hover:text-red-300">
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.02.015.04.03.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
        </svg>
        Sign in with Discord
      </button>
    </div>
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
export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOfficerPlus = session?.user?.role === 'OFFICER' || session?.user?.role === 'LEADER';
  const isGuestOrSignedOut = !session?.user || session.user.role === 'GUEST';

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
                Sleeping Dragons
              </span>
              <span className="text-[10px] font-light tracking-[0.25em] text-red-800/70 uppercase">
                EU · Light · Phoenix
              </span>
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
                      active ? 'text-white/85' : 'text-white/35 group-hover:text-white/65'
                    }`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}

            {/* Join - guests and signed-out users only */}
            {isGuestOrSignedOut && (
              <>
                <div className="mx-3 h-3.5 w-px bg-red-900/40" />
                <Link href="/apply">
                  <motion.span
                    className="inline-block border border-red-800/50 bg-red-950/25 px-5 py-1.5 text-xs font-light tracking-[0.25em] text-red-400/85 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}>
                    Join
                  </motion.span>
                </Link>
              </>
            )}

            {/* Admin - officers and leaders only */}
            {isOfficerPlus && (
              <>
                <div className="mx-3 h-3.5 w-px bg-red-900/40" />
                <Link href="/admin" className="group relative px-4 py-1.5">
                  {pathname.startsWith('/admin') && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute right-4 bottom-0 left-4 h-px bg-red-700"
                      transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    />
                  )}
                  <span
                    className={`text-xs font-light tracking-[0.25em] uppercase transition-colors duration-200 ${
                      pathname.startsWith('/admin') ? 'text-white/85' : 'text-white/35 group-hover:text-white/65'
                    }`}>
                    Admin
                  </span>
                </Link>
              </>
            )}

            <div className="mx-3 h-3.5 w-px bg-red-900/40" />
            <AuthButton />
          </div>

          {/* Mobile: auth + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <AuthButton />
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
                          active ? 'text-white/85' : 'text-white/35 hover:text-white/65'
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

                {/* Join Us - guests and signed-out only */}
                {isGuestOrSignedOut && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: LINKS.length * 0.06, duration: 0.2 }}>
                    <Link
                      href="/apply"
                      className="inline-block border border-red-800/50 bg-red-950/25 px-8 py-2.5 text-xs font-light tracking-[0.25em] text-red-400/85 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300">
                      Join Us
                    </Link>
                  </motion.div>
                )}

                {/* Admin - officers and leaders only */}
                {isOfficerPlus && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (LINKS.length + 0.5) * 0.06, duration: 0.2 }}>
                    <Link
                      href="/admin"
                      className={`flex items-center gap-4 py-3 text-sm font-light tracking-[0.25em] uppercase transition-colors duration-200 ${
                        pathname.startsWith('/admin') ? 'text-white/85' : 'text-white/35 hover:text-white/65'
                      }`}>
                      <span
                        className={`h-px w-4 transition-colors duration-200 ${
                          pathname.startsWith('/admin') ? 'bg-red-700' : 'bg-red-900/40'
                        }`}
                      />
                      Admin
                    </Link>
                  </motion.div>
                )}

                {/* Auth */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (LINKS.length + 1) * 0.06, duration: 0.2 }}>
                  <MobileAuthRow />
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
