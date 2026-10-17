'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeType = 'cyberpunk' | 'emerald' | 'violet' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => Promise<void>;
  isDark: boolean;
  toggleDarkLight: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'cyberpunk',
  setTheme: async () => {},
  isDark: true,
  toggleDarkLight: () => {},
  loading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('cyberpunk');
  const [loading, setLoading] = useState<boolean>(true);

  const applyThemeToDOM = (t: ThemeType) => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  const fetchServerTheme = async () => {
    try {
      // If user has already explicitly chosen a local preference, prioritize it
      const localPref = typeof window !== 'undefined' ? localStorage.getItem('user_theme_choice') : null;
      if (localPref && ['cyberpunk', 'emerald', 'violet', 'light'].includes(localPref)) {
        setThemeState(localPref as ThemeType);
        applyThemeToDOM(localPref as ThemeType);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/theme');
      const data = await res.json();
      if (data.success && data.theme) {
        const serverTheme = data.theme as ThemeType;
        setThemeState(serverTheme);
        applyThemeToDOM(serverTheme);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerTheme();
  }, []);

  const changeTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_theme_choice', newTheme);
    }

    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDarkLight = () => {
    if (theme === 'light') {
      changeTheme('cyberpunk');
    } else {
      changeTheme('light');
    }
  };

  const isDark = theme !== 'light';

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, isDark, toggleDarkLight, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
