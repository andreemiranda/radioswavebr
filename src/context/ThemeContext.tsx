import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'brazil' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('RadioWaveBR_theme');
    if (saved === 'brazil' || saved === 'dark') return saved;
    // Default to brazil theme (light/colorful) as requested
    return 'brazil';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('brazil', 'dark');
    root.classList.add(theme);
    localStorage.setItem('RadioWaveBR_theme', theme);

    // Dynamic meta theme-color for PWA/Mobile
    const themeColor = theme === 'dark' ? '#0B0F19' : '#F3F6F9';
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'brazil' ? 'dark' : 'brazil'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
