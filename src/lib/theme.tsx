'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type ThemeName = 'default' | 'taylor-swift';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  isTaylorSwift: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'default',
  setTheme: () => {},
  isTaylorSwift: false,
});

export function useTheme() {
  return useContext(ThemeContext);
}

const TS_SUCCESS_MESSAGES = [
  "You're doing amazing, sweetie! ✨",
  "Shake it off — grade saved! 💃",
  "This is our song... of progress! 🎵",
  "Another one in the books 📖",
  "Long story short, it saved! ⭐",
  "We are never ever getting behind on grades! 📝",
  "Welcome to the grading era! 🌟",
  "Grade saved — it's a love story, baby! 💜",
  "Look what you made me save! ✨",
  "Enchanted by this progress! 🦋",
];

export function getRandomTSMessage(): string {
  return TS_SUCCESS_MESSAGES[Math.floor(Math.random() * TS_SUCCESS_MESSAGES.length)];
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('default');
  const supabase = createClient();

  useEffect(() => {
    const loadTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme')
          .eq('id', user.id)
          .single();
        if (profile?.theme === 'taylor-swift') {
          setThemeState('taylor-swift');
        }
      }
    };
    loadTheme();
  }, [supabase]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isTaylorSwift: theme === 'taylor-swift' }}>
      {children}
    </ThemeContext.Provider>
  );
}
