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
      if (user) {
        setUser(user);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className={`border-b shadow-sm ${
      isTaylorSwift
        ? 'bg-[#1a1a2e] border-[#2e2e4a]'
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {isTaylorSwift ? (
              <span className="text-xl font-bold ts-gradient-text">
                ⭐ OT Tracker ✨
              </span>
            ) : (
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                ✨ OT Tracker
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isTaylorSwift
                  ? 'hover:bg-[#2a1a3e] text-[#f0e6d3]'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                isTaylorSwift
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#f4c2c2]'
                  : 'bg-gradient-to-r from-purple-400 to-purple-600'
              }`}>
                {user.email?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="hidden sm:inline truncate max-w-[120px]">{user.email}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {showMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-50 ${
                isTaylorSwift
                  ? 'bg-[#1a1a2e] border-[#2e2e4a]'
                  : 'bg-white border-gray-200'
              }`}>
                <Link
                  href="/profile"
                  className={`block px-4 py-2 text-sm ${
                    isTaylorSwift
                      ? 'text-[#f0e6d3] hover:bg-[#2a1a3e]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setShowMenu(false)}
                >
                  {isTaylorSwift ? '⭐ Profile' : '📋 Profile'}
                </Link>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                  className={`w-full text-left px-4 py-2 text-sm ${
                    isTaylorSwift
                      ? 'text-[#f0e6d3] hover:bg-[#2a1a3e]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  👋 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
