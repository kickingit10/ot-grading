'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme';
import type { User } from '@supabase/supabase-js';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const { isTaylorSwift, colorMode, setColorMode } = useTheme();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Fetch profile name
        supabase.from('profiles').select('full_name').eq('id', session.user.id).single()
          .then(({ data }) => { if (data?.full_name) setDisplayName(data.full_name); });
      }
    });
    return () => { subscription?.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  if (!user) return null;

  const firstName = displayName ? displayName.split(' ')[0] : null;
  const avatarLetter = (firstName || user.email || 'U')[0].toUpperCase();
  const nameOrEmail = firstName || user.email;

  const modeBtn = (mode: 'light' | 'dark' | 'system', svgPath: string) => (
    <button onClick={() => setColorMode(mode)} title={mode} aria-label={`${mode} mode`}
      style={{
        padding: 8, borderRadius: 8, transition: 'all 0.2s', cursor: 'pointer', border: 'none',
        background: colorMode === mode ? 'var(--color-primary-lighter)' : 'transparent',
        color: colorMode === mode ? 'var(--color-primary)' : 'var(--color-text-muted)',
      }}>
      <svg aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d={svgPath} />
      </svg>
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl"
      style={{ background: 'var(--color-nav-bg)', borderBottom: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div className="flex justify-between items-center h-14">
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary-surface, var(--color-primary))' }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <path d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path d="M9 14l2 2 4-4" />
            </svg>
            {isTaylorSwift ? (
              <span className="text-xl font-bold ts-gradient-text tracking-tight">OT Tracker <span className="text-xs font-normal" style={{ opacity: 0.7 }}>(Taylor&#39;s Version)</span></span>
            ) : (
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-primary-surface, var(--color-primary))' }}>OT Tracker</span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/reports" className="hidden sm:inline-block transition-colors" style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-muted)' }}>Reports</Link>
            <Link href="/guide" aria-label="Help" className="rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-200"
              style={{ width: 44, height: 44, minWidth: 44, borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>?</Link>

            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{ color: 'var(--color-text)' }}>
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{ background: 'var(--color-primary-surface, var(--color-primary))', color: 'var(--color-primary-btn-text)' }}>
                  {avatarLetter}
                </span>
                <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">{nameOrEmail}</span>
                <svg aria-hidden="true" className="w-3.5 h-3.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1.5 w-52 rounded-xl py-1 animate-fade-in z-[60]"
                  style={{ background: 'var(--color-bg, #ffffff)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                  onClick={(e) => e.stopPropagation()}>

                  <Link href="/profile" className="menu-item" onClick={() => setShowMenu(false)}>Profile</Link>
                  <Link href="/reports" className="menu-item sm:hidden" onClick={() => setShowMenu(false)}>Reports</Link>

                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 8, color: 'var(--color-text-muted)' }}>Appearance</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {modeBtn('light', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z')}
                      {modeBtn('dark', 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z')}
                      {modeBtn('system', 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z')}
                    </div>
                  </div>

                  <button onClick={() => { setShowMenu(false); supabase.auth.signOut().then(() => router.push('/login')); }} className="menu-item menu-item-muted">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
