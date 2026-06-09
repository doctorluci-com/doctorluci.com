import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ro from "./locales/ro.json";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import es from "./locales/es.json";

const isBrowser = typeof window !== "undefined";

if (!i18n.isInitialized) {
  if (isBrowser) {
    i18n.use(LanguageDetector);
  }
  i18n.use(initReactI18next).init({
    resources: {
      ro: { translation: ro },
      en: { translation: en },
      ru: { translation: ru },
      es: { translation: es },
    },
    fallbackLng: "ro",
    supportedLngs: ["ro", "en", "ru", "es"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    ...(isBrowser
      ? {
          detection: {
            order: ["localStorage", "navigator"],
            lookupLocalStorage: "lucia-lang",
            caches: ["localStorage"],
          },
        }
      : {}),
  });
}

export default i18n;