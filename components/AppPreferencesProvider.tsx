'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type AppLang = 'vi' | 'zh';
export type AppEdition = 'standard' | 'pro';

interface AppPreferencesContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  edition: AppEdition;
  setEdition: (edition: AppEdition) => void;
  t: (vi: string, zh: string) => string;
}

const DEFAULT_PREFERENCES: AppPreferencesContextValue = {
  lang: 'vi',
  setLang: () => {},
  edition: 'standard',
  setEdition: () => {},
  t: (vi) => vi,
};

const AppPreferencesContext = createContext<AppPreferencesContextValue>(DEFAULT_PREFERENCES);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>('vi');
  const [edition, setEditionState] = useState<AppEdition>('standard');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = localStorage.getItem('nirvaner-lang') ?? localStorage.getItem('ouranic-lang');
      if (savedLang === 'vi' || savedLang === 'zh') setLangState(savedLang);
      const savedEdition = localStorage.getItem('nirvaner-edition') ?? localStorage.getItem('ouranic-edition');
      if (savedEdition === 'standard' || savedEdition === 'pro') setEditionState(savedEdition);
    } catch { /* noop */ }
  }, []);

  const setLang = (next: AppLang) => {
    setLangState(next);
    if (mounted) {
      try { localStorage.setItem('nirvaner-lang', next); } catch { /* noop */ }
    }
  };

  const setEdition = (next: AppEdition) => {
    setEditionState(next);
    if (mounted) {
      try { localStorage.setItem('nirvaner-edition', next); } catch { /* noop */ }
    }
  };

  const t = (vi: string, zh: string) => (lang === 'vi' ? vi : zh);

  return (
    <AppPreferencesContext.Provider value={{ lang, setLang, edition, setEdition, t }}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export const useAppPreferences = () => {
  try {
    return useContext(AppPreferencesContext);
  } catch {
    return DEFAULT_PREFERENCES;
  }
};
