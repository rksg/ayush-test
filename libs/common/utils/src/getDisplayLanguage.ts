import { createIntl } from 'react-intl'

import { getIntl } from './intlUtil'

let cache: Record<string, string> = {}
export function getDisplayLanguage (locale: string) {
  if (cache[locale]) return cache[locale]
  const { $t, formatDisplayName } = getIntl()
  const args: Parameters<typeof formatDisplayName> = [locale, { type: 'language' }]

  const language = formatDisplayName(...args)!
  const languageInLocale = createIntl({ locale }).formatDisplayName(...args)
  const isEqual = language === languageInLocale

  const result = cache[locale] = isEqual ? language : $t(
    { defaultMessage: '{language} ({languageInLocale})' },
    { language, languageInLocale }
  )
  return result
}

export function reset () {
  cache = {}
}
