import { createIntl, createIntlCache, IntlConfig, IntlShape } from 'react-intl'

const globalIntlCache = createIntlCache()

let intl: IntlShape | undefined

export function setUpIntl (config?: IntlConfig) {
  if (!config) {
    intl = undefined
    return
  }
  
  intl = createIntl(config, globalIntlCache)
}

export function getIntl () {
  if (!intl) throw Error('setUpIntl must be called before getIntl')
  return intl
}
