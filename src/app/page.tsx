'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import OrnamentalRule from './components/ui/ornamental-rule';

// ── Ember particle ──────────────────────────────────────────────────────────
interface Ember {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

function EmberField() {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    const generated: Ember[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 10,
      drift: (Math.random() - 0.5) * 60,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setEmbers(generated);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            left: `${ember.x}%`,
            bottom: '-10px',
            width: ember.size,
            height: ember.size,
            background: `radial-gradient(circle, #ff4422 0%, #cc1100 60%, transparent 100%)`,
            boxShadow: `0 0 ${ember.size * 3}px ${ember.size}px rgba(200,30,0,0.6)`,
          }}
          animate={{
            y: [0, -(window?.innerHeight ?? 900) - 100],
            x: [0, ember.drift],
            opacity: [0, ember.opacity, ember.opacity, 0],
            scale: [0.5, 1, 0.8, 0.2],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Dragon SVG sigil ─────────────────────────────────────────────────────────
function DragonSigil() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="h-40 w-40 md:h-56 md:w-56"
      initial={{ opacity: 0, scale: 0.6, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}>
      <defs>
        <radialGradient id="sigilGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#cc2200" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#cc2200" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow backdrop */}
      <circle cx="100" cy="100" r="90" fill="url(#sigilGlow)" />

      {/* Outer ring */}
      <motion.circle
        cx="100"
        cy="100"
        r="85"
        stroke="#8b1a00"
        strokeWidth="1"
        fill="none"
        strokeDasharray="8 4"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '100px 100px' }}
      />
      <motion.circle
        cx="100"
        cy="100"
        r="78"
        stroke="#cc2200"
        strokeWidth="0.5"
        fill="none"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: '100px 100px' }}
      />

      {/* Dragon body — stylised sleeping coil */}
      <g filter="url(#glow)" stroke="#cc2200" strokeLinecap="round" fill="none">
        {/* Main coil */}
        <path
          d="M100 55 C130 55 155 70 160 90 C165 110 150 130 130 138 C110 146 85 140 70 125 C55 110 58 88 72 76 C82 68 95 65 105 70 C118 77 122 92 115 102 C108 112 92 112 85 104 C80 98 82 88 90 86"
          strokeWidth="3"
        />
        {/* Tail */}
        <path d="M160 90 C170 85 175 75 170 62 C166 52 158 48 152 50" strokeWidth="2" />
        {/* Head */}
        <path d="M100 55 C95 48 88 42 85 38 C90 34 98 35 103 40" strokeWidth="2.5" />
        {/* Horn */}
        <path d="M85 38 C80 30 76 24 78 20" strokeWidth="1.5" />
        {/* Eye */}
        <circle cx="91" cy="42" r="2.5" fill="#cc2200" stroke="none" />
        <motion.circle
          cx="91"
          cy="42"
          r="2.5"
          fill="#ff4422"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Wings suggestion */}
        <path d="M130 95 C145 80 160 75 168 82 C160 90 148 95 135 98" strokeWidth="1.5" />
        <path d="M75 95 C60 80 42 75 34 82 C42 90 54 95 68 98" strokeWidth="1.5" />
      </g>

      {/* Rune marks around ring */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 100 + 72 * Math.cos(rad);
        const y = 100 + 72 * Math.sin(rad);
        return (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill="#8b1a00"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, delay: i * 0.25, repeat: Infinity }}
          />
        );
      })}
    </motion.svg>
  );
}

// ── Scroll cue ───────────────────────────────────────────────────────────────
function ScrollCue() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 text-red-900"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.8, duration: 0.8 }}>
      <span className="text-xs font-light tracking-[0.3em] text-red-800/60 uppercase">Scroll</span>
      <motion.div
        className="h-8 w-px bg-gradient-to-b from-red-800/60 to-transparent"
        animate={{ scaleY: [1, 0.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'top' }}
      />
    </motion.div>
  );
}

// ── Info cards section ───────────────────────────────────────────────────────
const INFO = [
  {
    icon: '⚔',
    title: 'Who We Are',
    body: 'A tight-knit fellowship of adventurers on the Phoenix server. We raid, craft, and explore Eorzea together — from casual levelling to savage content.',
  },
  {
    icon: '🏰',
    title: 'Our House',
    body: 'Our Free Company estate sits in the Goblet, always open to members. Drop by for crafting facilities, the aesthetics room, and good company.',
  },
  {
    icon: '🐉',
    title: 'Join the Den',
    body: "We welcome Warriors of Light of all experience levels. Whether you're fresh off the MSQ or a seasoned raider, there's a place among the Dragons.",
  },
];

function InfoCards() {
  return (
    <section className="relative z-20 mx-auto max-w-5xl px-6 py-24">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {INFO.map((card, i) => (
          <motion.div
            key={card.title}
            className="group relative overflow-hidden rounded-sm border border-red-900/30 bg-black/50 p-7 backdrop-blur-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            whileHover={{ borderColor: 'rgba(153,30,0,0.7)' }}>
            {/* Corner accent */}
            <div className="absolute top-0 left-0 h-6 w-6 border-t border-l border-red-700/60" />
            <div className="absolute right-0 bottom-0 h-6 w-6 border-r border-b border-red-700/60" />

            {/* Hover glow */}
            <motion.div className="absolute inset-0 bg-red-950/0 transition-colors duration-500 group-hover:bg-red-950/20" />

            <div className="relative">
              <span className="mb-4 block text-2xl">{card.icon}</span>
              <h3 className="mb-3 text-xs font-light tracking-widest text-red-500 uppercase">{card.title}</h3>
              <p className="text-sm leading-relaxed font-light text-white/60">{card.body}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <main
      ref={containerRef}
      className="min-h-screen overflow-x-hidden bg-[#050303] text-white"
      style={{ fontFamily: "'Cormorant Garamond', 'Palatino Linotype', serif" }}>
      {/* ── Background layers ── */}
      {/* Deep radial vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #1a0300 0%, #0a0101 50%, #020000 100%)',
        }}
      />
      {/* Grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(180,30,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(180,30,0,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Bottom glow */}
      <div
        className="pointer-events-none fixed right-0 bottom-0 left-0 z-0 h-64"
        style={{
          background: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(160,20,0,0.25) 0%, transparent 70%)',
        }}
      />

      {/* ── Embers ── */}
      <EmberField />

      {/* ── Hero ── */}
      <motion.section
        className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ y: heroY, opacity: heroOpacity }}>
        {/* Sigil */}
        <div className="mb-8">
          <DragonSigil />
        </div>

        {/* Title */}
        <motion.h1
          className="mb-2 text-6xl font-extralight tracking-[0.12em] uppercase md:text-8xl lg:text-9xl"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #e8c8c0 40%, #c04030 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}
          initial={{ opacity: 0, y: 30, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.12em' }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          Sleeping
        </motion.h1>
        <motion.h1
          className="mb-8 text-6xl font-thin tracking-[0.18em] uppercase md:text-8xl lg:text-9xl"
          style={{
            background: 'linear-gradient(180deg, #cc3020 0%, #8b1a00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}>
          Dragons
        </motion.h1>

        {/* Ornamental divider */}
        <OrnamentalRule />

        {/* Subtitle */}
        <motion.p
          className="mt-6 text-sm font-light tracking-[0.45em] text-white/40 uppercase md:text-base"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.7, ease: 'easeOut' }}>
          Light &nbsp;·&nbsp; Phoenix
        </motion.p>

        {/* CTA */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.1 }}>
          <motion.button
            className="border border-red-800/60 px-10 py-3 text-xs font-light tracking-[0.25em] text-red-400/80 uppercase transition-all duration-300 hover:border-red-700 hover:bg-red-950/40 hover:text-red-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            Apply to Join
          </motion.button>
          <motion.button
            className="px-10 py-3 text-xs font-light tracking-[0.25em] text-white/30 uppercase transition-colors duration-300 hover:text-white/60"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            Learn More ↓
          </motion.button>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <ScrollCue />
        </div>
      </motion.section>

      {/* ── Info cards ── */}
      <InfoCards />
    </main>
  );
}
