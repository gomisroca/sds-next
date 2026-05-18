'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import OrnamentalRule from './components/ui/ornamental-rule';

// ── Ember particle ────────────────────────────────────────────────────────────
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
    setEmbers(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 12,
        drift: (Math.random() - 0.5) * 50,
        opacity: Math.random() * 0.5 + 0.2,
      }))
    );
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
            background: 'radial-gradient(circle, #ff6644 0%, #cc2200 60%, transparent 100%)',
            boxShadow: `0 0 ${ember.size * 3}px ${ember.size}px rgba(200,60,0,0.5)`,
          }}
          animate={{
            y: [0, -(window?.innerHeight ?? 900) - 100],
            x: [0, ember.drift],
            opacity: [0, ember.opacity, ember.opacity, 0],
            scale: [0.5, 1, 0.8, 0.2],
          }}
          transition={{ duration: ember.duration, delay: ember.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ── Dragon sigil ──────────────────────────────────────────────────────────────
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
      <circle cx="100" cy="100" r="90" fill="url(#sigilGlow)" />
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
      <g filter="url(#glow)" stroke="#cc2200" strokeLinecap="round" fill="none">
        <path
          d="M100 55 C130 55 155 70 160 90 C165 110 150 130 130 138 C110 146 85 140 70 125 C55 110 58 88 72 76 C82 68 95 65 105 70 C118 77 122 92 115 102 C108 112 92 112 85 104 C80 98 82 88 90 86"
          strokeWidth="3"
        />
        <path d="M160 90 C170 85 175 75 170 62 C166 52 158 48 152 50" strokeWidth="2" />
        <path d="M100 55 C95 48 88 42 85 38 C90 34 98 35 103 40" strokeWidth="2.5" />
        <path d="M85 38 C80 30 76 24 78 20" strokeWidth="1.5" />
        <circle cx="91" cy="42" r="2.5" fill="#cc2200" stroke="none" />
        <motion.circle
          cx="91"
          cy="42"
          r="2.5"
          fill="#ff6644"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <path d="M130 95 C145 80 160 75 168 82 C160 90 148 95 135 98" strokeWidth="1.5" />
        <path d="M75 95 C60 80 42 75 34 82 C42 90 54 95 68 98" strokeWidth="1.5" />
      </g>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.circle
            key={i}
            cx={100 + 72 * Math.cos(rad)}
            cy={100 + 72 * Math.sin(rad)}
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

// ── Scroll cue ────────────────────────────────────────────────────────────────
function ScrollCue() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.8, duration: 0.8 }}>
      <span className="text-xs font-light tracking-[0.3em] text-red-700/50 uppercase">Scroll</span>
      <motion.div
        className="h-8 w-px bg-gradient-to-b from-red-700/50 to-transparent"
        animate={{ scaleY: [1, 0.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'top' }}
      />
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export default function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <>
      {/* Background layers */}
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
      <div
        className="pointer-events-none fixed right-0 bottom-0 left-0 z-0 h-80"
        style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 100%, rgba(180,40,0,0.2) 0%, transparent 70%)' }}
      />

      <EmberField />

      <motion.section
        ref={ref}
        className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 text-center"
        style={{ y, opacity }}>
        <div className="mb-8">
          <DragonSigil />
        </div>

        <motion.h1
          className="mb-2 text-6xl font-extralight tracking-[0.12em] uppercase md:text-8xl lg:text-9xl"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #edd8d0 45%, #c04030 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ opacity: 0, y: 30, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '0.12em' }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          Sleeping
        </motion.h1>
        <motion.h1
          className="mb-8 text-6xl font-thin tracking-[0.18em] uppercase md:text-8xl lg:text-9xl"
          style={{
            background: 'linear-gradient(180deg, #dd4030 0%, #8b1a00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}>
          Dragons
        </motion.h1>

        <motion.div
          className="w-full"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}>
          <OrnamentalRule />
        </motion.div>

        <motion.p
          className="mt-6 text-sm font-light tracking-[0.45em] text-white/50 uppercase md:text-base"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.7, ease: 'easeOut' }}>
          EU &nbsp;·&nbsp; Light &nbsp;·&nbsp; Phoenix
        </motion.p>

        <motion.p
          className="mt-4 text-base font-light text-white/35 italic md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.0 }}>
          A friendly Free Company for every kind of adventurer
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}>
          <motion.a
            href="/join"
            className="border border-red-700/50 bg-red-950/20 px-10 py-3 text-xs font-light tracking-[0.25em] text-red-300/90 uppercase transition-all duration-300 hover:border-red-600/70 hover:bg-red-900/30 hover:text-red-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            Join Us
          </motion.a>
          <motion.a
            href="#welcome"
            className="px-10 py-3 text-xs font-light tracking-[0.25em] text-white/40 uppercase transition-colors duration-300 hover:text-white/65"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            Learn More ↓
          </motion.a>
        </motion.div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <ScrollCue />
        </div>
      </motion.section>
    </>
  );
}
