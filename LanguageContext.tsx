import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LanguageCode } from './types';
import { TRANSLATIONS, LANGUAGES } from './constants';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
  currentLanguageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const t = (key: string) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  const currentLanguageName = LANGUAGES.find(l => l.code === language)?.nativeName || 'English';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLanguageName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
