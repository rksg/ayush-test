import { useState, useEffect } from 'react'

import { getUserProfile }                     from '@acx-ui/analytics/utils'
import { IFrame }                             from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { useIsSplitOn, Features }             from '@acx-ui/feature-toggle'
import { useAuthenticateMutation }            from '@acx-ui/reports/services'
import { getUserProfile as getUserProfileR1 } from '@acx-ui/user'
import {  useLocaleContext }                  from '@acx-ui/utils'

export const getHostName = (origin: string) => {
  if (process.env['NODE_ENV'] === 'development') {
    return get('IS_MLISA_SA')
      ? 'https://staging.mlisa.io'
      : 'https://dev.ruckus.cloud'
  }
  return origin
}

export function DataStudio () {
  const [url, setUrl] = useState<string>()
  const [authenticate] = useAuthenticateMutation()

  const defaultLocale = 'en'
  const i18nDataStudioEnabled = useIsSplitOn(Features.I18N_DATA_STUDIO_TOGGLE)
  const localeContext = useLocaleContext()
  const locale = i18nDataStudioEnabled
    ? localeContext.messages?.locale ?? defaultLocale
    : defaultLocale

  useEffect(() => {
    const { firstName, lastName, email } = get('IS_MLISA_SA')
      ? getUserProfile()
      : getUserProfileR1().profile

    authenticate({
      payload: {
        user: {
          firstName,
          lastName,
          email
        }
      },
      params: {
        locale
      }
    })
      .unwrap()
      .then(url => {
        setUrl(url)
      })
  }, [authenticate, locale])

  return (
    <div data-testid='data-studio'
      style={{
        height: 'calc(100vh - 100px)'
      }}>
      {url && (
        <IFrame
          title='data-studio'
          src={`${getHostName(window.location.origin)}${url}`}
          style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
        />
      )}
    </div>
  )
}
