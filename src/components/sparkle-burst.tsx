'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  delay: number;
}

const EMOJIS = ['✨', '⭐', '🌟', '💜', '🎉'];
const TS_EMOJIS = ['✨', '⭐', '🌟', '💜', '🦋', '💛'];

export function SparkleBurst({ active, isTaylorSwift = false }: { active: boolean; isTaylorSwift?: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const emojis = isTaylorSwift ? TS_EMOJIS : EMOJIS;
      const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 40 + 30,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        delay: Math.random() * 0.3,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 1200);
      return () => clearTimeout(timer);
    }
  }, [active, isTaylorSwift]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="sparkle-particle text-lg"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
