import { OnErrorFn, IntlErrorCode }                           from '@formatjs/intl'
import { createIntl, createIntlCache, IntlConfig, IntlShape } from 'react-intl'

import { AccountVertical, getJwtTokenPayload } from './jwtToken'
import { LocaleContextType }                   from './locales'

const globalIntlCache = createIntlCache()

let intl: IntlShape | undefined

export class IntlSetUpError extends Error {}

export const onIntlError: OnErrorFn = (error) => {
  if (process.env['NODE_ENV'] === 'production') return
  if (error.code === IntlErrorCode.MISSING_TRANSLATION) return
  // eslint-disable-next-line no-console
  console.error(error)
}

export function getReSkinningElements (
  supportReSkinning = false, locale?: Pick<LocaleContextType, 'lang' | 'messages'>
) {
  // eslint-disable-next-line max-len
  const intl = locale ? createIntl({ locale: locale.lang, messages: locale.messages }, globalIntlCache) : null
  const { acx_account_vertical } = getJwtTokenPayload()
  return acx_account_vertical === AccountVertical.HOSPITALITY && supportReSkinning ? {
    venueSingular: () => intl ? intl.$t({ defaultMessage: 'space' }) : 'space',
    venuePlural: () => intl ? intl.$t({ defaultMessage: 'spaces' }) : 'spaces',
    VenueSingular: () => intl ? intl.$t({ defaultMessage: 'Space' }) : 'Space',
    VenuePlural: () => intl ? intl.$t({ defaultMessage: 'Spaces' }) : 'Spaces'
  } : {
    venueSingular: () => intl ? intl.$t({ defaultMessage: 'venue' }) : 'venue' ,
    venuePlural: () => intl ? intl.$t({ defaultMessage: 'venues' }) : 'venues',
    VenueSingular: () => intl ? intl.$t({ defaultMessage: 'Venue' }) : 'Venue',
    VenuePlural: () => intl ? intl.$t({ defaultMessage: 'Venues' }) : 'Venues'
  }
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
  if (!intl) throw new IntlSetUpError()
  return intl
}
