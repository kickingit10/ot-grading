'use client';

import { useEffect, useState } from 'react';

interface Particle { id: number; x: number; y: number; char: string; delay: number; }

const CHARS = ['·', '✦', '·', '✧', '·'];
const TS_CHARS = ['★', '✦', '★', '✧', '★'];

export function SparkleBurst({ active, isTaylorSwift = false }: { active: boolean; isTaylorSwift?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const chars = isTaylorSwift ? TS_CHARS : CHARS;
      const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
        char: chars[Math.floor(Math.random() * chars.length)],
        delay: Math.random() * 0.2,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 1000);
      return () => clearTimeout(timer);
    }
  }, [active, isTaylorSwift]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <span key={p.id} className="sparkle-particle text-xs opacity-60"
          style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.delay}s`, color: 'var(--color-primary-surface, var(--color-primary))' }}>
          {p.char}
        </span>
      ))}
    </div>
  );
}
