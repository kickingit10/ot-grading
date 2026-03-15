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

  const menuItem = `block w-full text-left px-3 py-2 text-sm transition-colors duration-150`;
  const menuItemCls = isDark ? `${menuItem} text-[var(--color-text)] hover:bg-white/[0.06]` : `${menuItem} text-slate-700 hover:bg-slate-50`;

  const modeBtn = (mode: 'light' | 'dark' | 'system', icon: string) => (
    <button onClick={() => setColorMode(mode)} title={mode}
      className={`p-1.5 rounded transition-all duration-200 ${
        colorMode === mode
          ? isDark ? 'bg-white/[0.12] text-[var(--color-text)]' : 'bg-indigo-100 text-indigo-700'
          : isDark ? 'text-[var(--color-text-muted)] hover:bg-white/[0.06]' : 'text-slate-400 hover:bg-slate-50'
      }`}
      dangerouslySetInnerHTML={{ __html: icon }}
    />
  );

  const sunIcon = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke-width="2"/><path stroke-width="2" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moonIcon = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  const monitorIcon = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" stroke-width="2"/><path stroke-width="2" d="M8 21h8m-4-4v4"/></svg>';

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ background: isDark ? 'rgba(15,15,15,0.8)' : 'rgba(255,255,255,0.8)', borderColor: 'var(--color-border)' }}>
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
            <Link href="/guide" className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-200" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>?</Link>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all duration-200" style={{ color: 'var(--color-text)' }}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white ${isTaylorSwift ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-indigo-500'}`}>
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden sm:inline text-sm truncate max-w-[140px]">{user.email}</span>
                <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-lg shadow-lg border py-1 animate-fade-in" style={{ background: isDark ? '#1a1a1a' : '#fff', borderColor: 'var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
                  <Link href="/profile" className={menuItemCls} onClick={() => setShowMenu(false)}>Profile</Link>

                  {/* Theme toggle */}
                  <div className="px-3 py-2 border-t border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Appearance</div>
                    <div className="flex gap-1">
                      {modeBtn('light', sunIcon)}
                      {modeBtn('dark', moonIcon)}
                      {modeBtn('system', monitorIcon)}
                    </div>
                  </div>

                  <button onClick={() => { setShowMenu(false); supabase.auth.signOut().then(() => { router.push('/login'); }); }} className={menuItemCls}>
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
