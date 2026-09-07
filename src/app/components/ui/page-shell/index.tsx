const FONT_STYLE = { fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" };

/**
 * PageShell wraps every public page.
 * Provides the dark background, grid texture, and base typography.
 */
export function PageShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={`min-h-screen bg-[#060404] pt-14 text-white ${className}`} style={FONT_STYLE}>
      <PageBackground />
      {children}
    </main>
  );
}

/**
 * PageBackground renders the two fixed background layers.
 * Used directly by PageShell and by non-<main> wrappers like the admin layout.
 */
export function PageBackground() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 75% at 50% 35%, #200504 0%, #0d0202 55%, #030101 100%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(200,50,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,50,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
    </>
  );
}
