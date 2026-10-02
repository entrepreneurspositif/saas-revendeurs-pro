'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'cyberpunk' | 'emerald' | 'violet' | 'light';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'cyberpunk',
  setTheme: async () => {},
  loading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('cyberpunk');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTheme = async () => {
    try {
      const res = await fetch('/api/theme');
      const data = await res.json();
      if (data.success && data.theme) {
        setThemeState(data.theme as ThemeType);
        document.documentElement.setAttribute('data-theme', data.theme);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    // Poll theme setting every 5s so when Admin changes theme, Storefront updates automatically!
    const interval = setInterval(fetchTheme, 5000);
    return () => clearInterval(interval);
  }, []);

  const changeTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
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

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
