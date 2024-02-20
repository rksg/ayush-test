import { useState, useEffect } from 'react'

import { getUserProfile }                     from '@acx-ui/analytics/utils'
import { IFrame, showActionModal }            from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { useIsSplitOn, Features }             from '@acx-ui/feature-toggle'
import { useAuthenticateMutation }            from '@acx-ui/reports/services'
import type { DataStudioResponse }            from '@acx-ui/reports/services'
import { getUserProfile as getUserProfileR1 } from '@acx-ui/user'
import { useLocaleContext, getIntl }          from '@acx-ui/utils'

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

function showExpiredSessionModal () {
  const { $t } = getIntl()
  showActionModal({
    type: 'info',
    title: $t({ defaultMessage: 'Session Expired' }),
    content: $t({ defaultMessage: 'Your session has expired. Please login again.' }),
    onOk: () => window.location.reload()
  })
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

  /**
   * Show expired session modal if session is expired, triggered from sueprset
   */
  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'unauthorized') {
        showExpiredSessionModal()
      }
    }
    window.addEventListener('message', eventHandler)
    return () => window.removeEventListener('message', eventHandler)
  }, [])

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
      .then((resp: DataStudioResponse) => {
        const { redirect_url, user_info } = resp
        if (!user_info) { // TODO - Added for backward compatibility. Need to remove it
          setUrl(redirect_url)
        } else {
          // store user info
          sessionStorage.setItem('user_info', JSON.stringify(user_info))
          const { tenant_id, is_franchisor, tenant_ids } = user_info
          // Lets also set the params for the iframe
          const searchParams = new URLSearchParams()
          searchParams.append('mlisa_own_tenant_id', tenant_id)
          searchParams.append('mlisa_tenant_ids', tenant_ids.join(','))
          searchParams.append('is_franchisor', is_franchisor)

          setUrl(`${resp.redirect_url}?${searchParams.toString()}`)
        }
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
