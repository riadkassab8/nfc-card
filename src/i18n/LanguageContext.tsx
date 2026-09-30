import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { ar } from './ar';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  formatStatus: (status: string) => string;
  formatNumber: (val: number) => string;
}

const dictionaries = { ar, en };

// Isolated preference reader (no direct coupling in components)
const getInitialLanguage = (): Language => {
  try {
    const saved = window.localStorage.getItem('nfc_platform_lang');
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {
    // Ignore if restricted
  }
  return 'ar'; // Default to Arabic per prompt preference
};

const saveLanguagePreference = (lang: Language) => {
  try {
    window.localStorage.setItem('nfc_platform_lang', lang);
  } catch {
    // Ignore if restricted
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>(getInitialLanguage);

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRtl = direction === 'rtl';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    saveLanguagePreference(language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
  };

  const toggleLanguage = () => {
    setLangState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  // Helper to retrieve nested keys e.g. t('admin.businesses.title')
  const t = (path: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[language] || dictionaries.ar;
    const keys = path.split('.');
    let current: any = dict;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to Arabic dictionary if key missing
        let fallback: any = dictionaries.ar;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return path;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    let result = current;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  const formatStatus = (statusStr: string): string => {
    if (!statusStr) return '';
    const upper = statusStr.toUpperCase();
    const statusMap = dictionaries[language]?.status || dictionaries.ar.status;
    return (statusMap as any)[upper] || statusStr;
  };

  const formatNumber = (val: number): string => {
    return val.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US');
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRtl,
        setLanguage,
        toggleLanguage,
        t,
        formatStatus,
        formatNumber,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
