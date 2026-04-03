import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'brightpath_theme';
const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch (error) {
    console.error('Error reading theme preference:', error);
  }

  return getSystemTheme();
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.setAttribute('data-theme', theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(() => ({
    theme,
    isDarkMode: theme === 'dark',
    setTheme,
    toggleTheme,
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export default ThemeContext;