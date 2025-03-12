import { useState, useEffect, useCallback } from 'react'

import { showExpiredSessionModal }            from '@acx-ui/analytics/components'
import { getUserProfile }                     from '@acx-ui/analytics/utils'
import { IFrame, Loader }                     from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { useIsSplitOn, Features }             from '@acx-ui/feature-toggle'
import { useAuthenticateMutation }            from '@acx-ui/reports/services'
import type { DataStudioResponse }            from '@acx-ui/reports/services'
import { refreshJWT }                         from '@acx-ui/store'
import { getUserProfile as getUserProfileR1 } from '@acx-ui/user'
import { useLocaleContext }                   from '@acx-ui/utils'

export const getHostName = (origin: string) => {
  if (process.env['NODE_ENV'] === 'development') {
    return get('IS_MLISA_SA')
      ? 'https://staging.mlisa.io'
      // ? 'https://local.mlisa.io'
      : 'https://dev.ruckus.cloud'
      // : 'https://alto.local.mlisa.io'
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

  const eventHandler = useCallback((event: MessageEvent) => {
    if (event.data) {
      if (event.data.type === 'unauthorized') {
        showExpiredSessionModal()
      } else if (event.data.type === 'refreshToken') {
        refreshJWT(event.data)
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('message', eventHandler)
    return () => window.removeEventListener('message', eventHandler)
  }, [eventHandler])

  useEffect(() => {
    const { firstName, lastName, email } = get('IS_MLISA_SA')
      ? getUserProfile()
      : getUserProfileR1().profile

    authenticate({
      payload: { user: { firstName, lastName, email } },
      params: { locale }
    })
      .unwrap()
      .then(({ redirect_url, user_info }: DataStudioResponse) => {
        sessionStorage.setItem('user_info', JSON.stringify(user_info))
        const searchParams = new URLSearchParams()
        const { cache_key } = user_info ?? {}
        if (cache_key) {
          searchParams.append('cache_key', cache_key)
          setUrl(`${redirect_url}?${searchParams.toString()}`)
        } else {
          setUrl(redirect_url)
        }
      })
  }, [authenticate, locale])

  return (
    <div data-testid='data-studio' style={{ height: 'calc(100vh - 100px)' }}>
      <Loader states={[{ isLoading: !url }]}>
        {url && (
          <IFrame
            title='data-studio'
            src={`${getHostName(window.location.origin)}${url}`}
            style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden' }}
          />
        )}
      </Loader>
    </div>
  )
}
