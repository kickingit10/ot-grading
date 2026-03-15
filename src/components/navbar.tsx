'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import type { User } from '@supabase/supabase-js';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { isTaylorSwift, isDark, colorMode, setColorMode } = useTheme();

  useEffect(() => {
    const getUser = async () => { const { data: { user } } = await supabase.auth.getUser(); if (user) setUser(user); };
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => { setUser(session?.user ?? null); });
    return () => { subscription?.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  if (!user) return null;

  const modeBtn = (mode: 'light' | 'dark' | 'system', svgPath: string) => (
    <button onClick={() => setColorMode(mode)} title={mode}
      className="p-1.5 rounded-md transition-all duration-200"
      style={{
        background: colorMode === mode ? 'var(--color-primary-lighter)' : 'transparent',
        color: colorMode === mode ? 'var(--color-primary)' : 'var(--color-text-muted)',
      }}>
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d={svgPath} />
      </svg>
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ background: isDark ? 'rgba(15,15,15,0.85)' : 'rgba(255,255,255,0.85)', borderColor: 'var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-1.5">
            {isTaylorSwift && isDark ? (
              <span className="text-lg font-semibold ts-gradient-text tracking-tight">OT Tracker</span>
            ) : (
              <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--color-text)' }}>OT Tracker</span>
            )}
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/guide" className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-200"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>?</Link>

            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{ color: 'var(--color-text)' }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                  style={{ background: 'var(--color-primary)' }}>
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden sm:inline text-sm truncate max-w-[140px]">{user.email}</span>
                <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 animate-fade-in z-[60]"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.12)',
                  }}
                  onClick={(e) => e.stopPropagation()}>

                  <Link href="/profile"
                    className="block px-3 py-2 text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setShowMenu(false)}>
                    Profile
                  </Link>

                  {/* Appearance toggle */}
                  <div className="px-3 py-2.5 border-t border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--color-text-muted)' }}>Appearance</div>
                    <div className="flex gap-1">
                      {modeBtn('light', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z')}
                      {modeBtn('dark', 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z')}
                      {modeBtn('system', 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z')}
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowMenu(false); supabase.auth.signOut().then(() => router.push('/login')); }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors duration-150"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
