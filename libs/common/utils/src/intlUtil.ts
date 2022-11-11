import { OnErrorFn, IntlErrorCode }                           from '@formatjs/intl'
import { createIntl, createIntlCache, IntlConfig, IntlShape } from 'react-intl'

const globalIntlCache = createIntlCache()

let intl: IntlShape | undefined

export const onIntlError: OnErrorFn = (error) => {
  if (process.env['NODE_ENV'] === 'production') return
  if (error.code === IntlErrorCode.MISSING_TRANSLATION) return
  // eslint-disable-next-line no-console
  console.error(error)
}

export function setUpIntl (config?: IntlConfig) {
  if (!config) {
    intl = undefined
    return
  }

  config = { onError: onIntlError, ...config }
  intl = createIntl(config, globalIntlCache)
}

export function getIntl () {
  if (!intl) throw Error('setUpIntl must be called before getIntl')
  return intl
}
