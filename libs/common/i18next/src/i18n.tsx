import i18n                 from 'i18next'
import LanguageDetector     from 'i18next-browser-languagedetector'
import Backend              from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
// import translate from '../locales/en/translation.json'
// import { DateTime } from 'luxon'
const lang = 'en'
i18n
  .use(LanguageDetector) // detect user language
  .use(Backend) // loads translations from your server
  .use(initReactI18next) // init i18next
  .init({
    debug: true,
    fallbackLng: 'en',
    lng: lang,
    backend: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json' // TODO: wip 
    },
    interpolation: {
      escapeValue: false
    },
    resources: {
      en: {
        translation: {
          title: 'Dashboard',
          description: 'Testing i18next framework integration',
          add: 'Add',
          entirOrg: 'Entire Organization',
          last24Hrs: 'Last 24 Hours'
        }
      },
      de: {
        translation: {
          title: 'DE: Dashboard',
          description: 'De: Testing i18next framework integration',
          add: 'De: Add',
          entirOrg: 'De: Entire Organization',
          last24Hrs: 'DE: Last 24 Hours'
        }
      }
    }
  })

export default i18n
