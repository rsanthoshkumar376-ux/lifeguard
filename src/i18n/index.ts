import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../../public/locales/en/translation.json';
import ta from '../../public/locales/ta/translation.json';
import hi from '../../public/locales/hi/translation.json';
import te from '../../public/locales/te/translation.json';
import kn from '../../public/locales/kn/translation.json';
import ml from '../../public/locales/ml/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
      te: { translation: te },
      kn: { translation: kn },
      ml: { translation: ml },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ta', 'hi', 'te', 'kn', 'ml'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
