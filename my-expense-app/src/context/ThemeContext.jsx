import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'system';
  });

  // Actual dark mode state based on theme selection
  const [darkMode, setDarkMode] = useState(false);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateDarkMode = () => {
      if (theme === 'system') {
        setDarkMode(mediaQuery.matches);
      } else {
        setDarkMode(theme === 'dark');
      }
    };

    updateDarkMode();
    
    // Listen for system theme changes
    const handler = () => {
      if (theme === 'system') {
        setDarkMode(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Apply dark mode class to document
  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, theme]);

  // Cycle through themes: light -> dark -> system -> light
  const toggleDarkMode = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };

  // Set specific theme
  const setThemeMode = (mode) => {
    setTheme(mode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
