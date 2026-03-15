'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type ThemeName = 'default' | 'taylor-swift';
type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isTaylorSwift: boolean;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default', setTheme: () => {}, isTaylorSwift: false,
  colorMode: 'light', setColorMode: () => {}, isDark: false,
});

export function useTheme() { return useContext(ThemeContext); }

const TS_SUCCESS_MESSAGES = [
  "Shake it off — grade saved! 💃",
  "This is our song... of progress! 🎵",
  "Long story short, it saved! ⭐",
  "We are never ever getting behind on grades! 📝",
  "Welcome to the grading era! 🌟",
  "Look what you made me save! ✨",
  "Enchanted by this progress! 🦋",
  "All too well... graded! 📖",
  "Begin again... another grade! 🎶",
  "Fearless grading energy! 💛",
  "This is a Midnights masterpiece! 🌙",
  "Anti-hero? More like pro-grader! ⭐",
  "Blank space? Not anymore! 📝",
  "Love story: you + grades = 💜",
];

export function getRandomTSMessage(): string {
  return TS_SUCCESS_MESSAGES[Math.floor(Math.random() * TS_SUCCESS_MESSAGES.length)];
}

const COLOR_MODE_KEY = 'ot-color-mode';

function resolveMode(mode: ColorMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('default');
  const [colorMode, setColorModeState] = useState<ColorMode>('light');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');
  const supabase = createClient();

  // Load profile theme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('theme').eq('id', user.id).single();
          if (profile?.theme === 'taylor-swift') setThemeState('taylor-swift');
        }
      } catch { /* no session */ }
    };
    loadTheme();
  }, [supabase]);

  // Load color mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(COLOR_MODE_KEY) as ColorMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setColorModeState(saved);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    setResolvedMode(resolveMode(colorMode));
    if (colorMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setResolvedMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [colorMode]);

  // Apply to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-mode', resolvedMode);
  }, [theme, resolvedMode]);

  const setTheme = useCallback((newTheme: ThemeName) => { setThemeState(newTheme); }, []);
  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem(COLOR_MODE_KEY, mode);
    setResolvedMode(resolveMode(mode));
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, isTaylorSwift: theme === 'taylor-swift',
      colorMode, setColorMode, isDark: resolvedMode === 'dark',
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
