import type React from "react";
import { createContext, useState, useEffect, useCallback } from "react";
import { DEFAULT_LOCALE, LOCALES, translations } from "@/lib/i18n";
import type { Locale, TranslationKey } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE);

  useEffect(() => {
    const storedLocale = localStorage.getItem("lingoleap-locale") as Locale | null;
    if (storedLocale && LOCALES.includes(storedLocale)) {
      setLocaleState(storedLocale);
    } else if (initialLocale) {
       setLocaleState(initialLocale);
    }
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (LOCALES.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem("lingoleap-locale", newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);
  
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);


  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      return translations[locale]?.[key] || fallback || translations[DEFAULT_LOCALE]?.[key] || String(key);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};
