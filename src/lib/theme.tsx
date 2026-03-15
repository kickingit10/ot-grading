'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type ThemeName = 'default' | 'taylor-swift';
type ColorMode = 'light' | 'dark' | 'system';
export type EraName = 'lover' | 'fearless' | 'speakNow' | 'red' | 'folklore' | 'evermore' | 'midnights' | 'reputation' | '1989' | 'torturedPoets';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isTaylorSwift: boolean;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  isDark: boolean;
  era: EraName;
  setEra: (era: EraName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default', setTheme: () => {}, isTaylorSwift: false,
  colorMode: 'light', setColorMode: () => {}, isDark: false,
  era: 'lover', setEra: () => {},
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
const ERA_KEY = 'ot-era';
const VALID_ERAS: EraName[] = ['lover', 'fearless', 'speakNow', 'red', 'folklore', 'evermore', 'midnights', 'reputation', '1989', 'torturedPoets'];

function resolveMode(mode: ColorMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('default');
  const [colorMode, setColorModeState] = useState<ColorMode>('light');
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');
  const [era, setEraState] = useState<EraName>('lover');
  const supabase = createClient();

  // Load profile theme + era
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('theme, era').eq('id', user.id).single();
          if (profile?.theme === 'taylor-swift') setThemeState('taylor-swift');
          if (profile?.era && VALID_ERAS.includes(profile.era as EraName)) setEraState(profile.era as EraName);
        }
      } catch { /* no session */ }
    };
    // Load era from localStorage first for instant hydration
    const savedEra = localStorage.getItem(ERA_KEY) as EraName | null;
    if (savedEra && VALID_ERAS.includes(savedEra)) setEraState(savedEra);
    loadTheme();
  }, [supabase]);

  // Load color mode
  useEffect(() => {
    const saved = localStorage.getItem(COLOR_MODE_KEY) as ColorMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) setColorModeState(saved);
  }, []);

  // System theme listener
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
    const el = document.documentElement;
    el.setAttribute('data-theme', theme);
    el.setAttribute('data-mode', resolvedMode);
    if (theme === 'taylor-swift') {
      el.setAttribute('data-era', era);
    } else {
      el.removeAttribute('data-era');
    }
  }, [theme, resolvedMode, era]);

  const setTheme = useCallback((t: ThemeName) => setThemeState(t), []);
  const setColorMode = useCallback((m: ColorMode) => {
    setColorModeState(m);
    localStorage.setItem(COLOR_MODE_KEY, m);
    setResolvedMode(resolveMode(m));
  }, []);
  const setEra = useCallback((e: EraName) => {
    setEraState(e);
    localStorage.setItem(ERA_KEY, e);
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme, setTheme, isTaylorSwift: theme === 'taylor-swift',
      colorMode, setColorMode, isDark: resolvedMode === 'dark',
      era, setEra,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
