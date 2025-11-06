import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';

export type ThemeName = 'lofi' | 'githubDark';

interface ThemeModeContextValue {
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = 'lofiles:theme';

const getInitialTheme = (): ThemeName => {
  if (typeof window === 'undefined') {
    return 'githubDark';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'githubDark' || stored === 'lofi' ? stored : 'githubDark';
};

interface ThemeModeProviderProps {
  children: React.ReactNode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<ThemeName>(getInitialTheme);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, themeName);
    }
  }, [themeName]);

  const toggleTheme = useCallback(() => {
    setThemeName(prev => (prev === 'lofi' ? 'githubDark' : 'lofi'));
  }, []);

  const value = useMemo(
    () => ({
      themeName,
      toggleTheme,
      setTheme: setThemeName
    }),
    [themeName, toggleTheme]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};


