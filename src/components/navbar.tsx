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
  const { isTaylorSwift } = useTheme();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { subscription?.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showMenu]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
      isTaylorSwift
        ? 'bg-[#0a0a14]/80 border-white/[0.06]'
        : 'bg-white/80 border-slate-200/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-1.5">
            {isTaylorSwift ? (
              <span className="text-lg font-semibold ts-gradient-text tracking-tight">OT Tracker</span>
            ) : (
              <span className="text-lg font-semibold text-slate-900 tracking-tight">OT Tracker</span>
            )}
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/guide" className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-200 ${
              isTaylorSwift ? 'border-white/[0.1] text-[#9ca3af] hover:bg-white/[0.06]' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}>?</Link>
            <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                isTaylorSwift
                  ? 'hover:bg-white/[0.06] text-[#f0e6d3]'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                isTaylorSwift
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700'
                  : 'bg-indigo-500'
              }`}>
                {user.email?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="hidden sm:inline text-sm truncate max-w-[140px]">{user.email}</span>
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <div className={`absolute right-0 mt-1.5 w-44 rounded-lg shadow-lg border py-1 animate-fade-in ${
                isTaylorSwift
                  ? 'bg-[#141420] border-white/[0.08]'
                  : 'bg-white border-slate-200'
              }`} onClick={(e) => e.stopPropagation()}>
                <Link
                  href="/profile"
                  className={`block px-3 py-2 text-sm transition-colors duration-150 ${
                    isTaylorSwift
                      ? 'text-[#f0e6d3] hover:bg-white/[0.06]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setShowMenu(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => { setShowMenu(false); handleLogout(); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                    isTaylorSwift
                      ? 'text-[#f0e6d3] hover:bg-white/[0.06]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
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
