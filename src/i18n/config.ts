import { createContext, useContext } from "react";
import en from "./en.json";
import zh from "./zh.json";

export type Locale = "zh" | "en";

export const translations: Record<Locale, Record<string, string>> = {
  zh,
  en,
};

export interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType>({
  locale: "zh",
  setLocale: () => {},
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);
