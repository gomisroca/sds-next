import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      className="min-h-screen bg-[#060404] pt-14 text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)' }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,50,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,50,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 text-center">
        {/* Dragon sigil stub — just the ring for a minimal touch */}
        <svg viewBox="0 0 80 80" className="mb-8 h-16 w-16 opacity-20" aria-hidden>
          <circle cx="40" cy="40" r="36" stroke="#cc2200" strokeWidth="0.75" fill="none" strokeDasharray="8 4" />
          <circle cx="40" cy="40" r="28" stroke="#8b1a00" strokeWidth="0.5" fill="none" />
        </svg>

        {/* 404 */}
        <p
          className="mb-2 text-8xl font-extralight tracking-[0.15em] md:text-9xl"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #edd8d0 45%, #c04030 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
          404
        </p>

        <div className="my-6 flex w-full max-w-xs items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-900 to-red-700" />
          <div className="h-1.5 w-1.5 rotate-45 bg-red-700" />
          <div className="h-2.5 w-2.5 rotate-45 border border-red-600" />
          <div className="h-1.5 w-1.5 rotate-45 bg-red-700" />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-900 to-red-700" />
        </div>

        <h1 className="mb-3 text-xl font-extralight tracking-[0.15em] text-white/70 uppercase md:text-2xl">
          Page Not Found
        </h1>
        <p className="mb-10 text-sm font-light text-white/35">This page doesn't exist or has been moved.</p>

        <Link
          href="/"
          className="border border-red-800/50 bg-red-950/20 px-10 py-3 text-xs font-light tracking-[0.25em] text-red-400/85 uppercase transition-all duration-300 hover:border-red-700/70 hover:bg-red-900/30 hover:text-red-300">
          Return Home
        </Link>
      </div>
    </main>
  );
}
