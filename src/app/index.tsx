import { useCallback, useMemo, useState } from "react";
import { I18nContext, type Locale, translations } from "../i18n/config";
import App from "./App";

export default function AppProvider() {
  const [locale, setLocale] = useState<Locale>("zh");

  const t = useCallback(
    (key: string) => {
      return translations[locale][key] ?? key;
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  return (
    <I18nContext.Provider value={value}>
      <App />
    </I18nContext.Provider>
  );
}
