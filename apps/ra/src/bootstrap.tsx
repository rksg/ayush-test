import React from 'react'

import { Root }          from 'react-dom/client'
import { addMiddleware } from 'redux-dynamic-middlewares'

import { getPendoConfig, setUserProfile } from '@acx-ui/analytics/utils'
import {
  ConfigProvider,
  Loader,
  showActionModal,
  SuspenseBoundary
} from '@acx-ui/components'
import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'
import {
  renderPendo,
  useLocaleContext,
  LangKey,
  DEFAULT_SYS_LANG,
  LocaleProvider,
  setUpIntl,
  getIntl
} from '@acx-ui/utils'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'
import type { AnyAction } from '@reduxjs/toolkit'

// Needed for Browser language detection
const supportedLocales: Record<string, LangKey> = {
  'en-US': 'en-US',
  'en': 'en-US',
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'de-DE': 'de-DE',
  'de': 'de-DE',
  'ja-JP': 'ja-JP',
  'ja': 'ja-JP',
  'fr-FR': 'fr-FR',
  'ko-KR': 'ko-KR',
  'pt-BR': 'pt-BR'
}

export function loadMessages (locales: readonly string[]): LangKey {
  const locale = locales.find(locale =>
    supportedLocales[locale as keyof typeof supportedLocales]) || DEFAULT_SYS_LANG
  return supportedLocales[locale as keyof typeof supportedLocales]
}

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const { lang } = useLocaleContext()
  const { children } = props
  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    children={<ConfigProvider children={children} lang={loadMessages([lang])} />}
  />
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

function detectExpiredSession (action: AnyAction, next: CallableFunction) {
  if (action.meta?.baseQueryMeta?.response?.status === 401) {
    showExpiredSessionModal()
  } else {
    return next(action)
  }
}

export async function init (root: Root) {
  addMiddleware(() => next => action => detectExpiredSession(action, next))
  setUpIntl({ locale: 'en-US' })
  const user = await fetch('/analytics/api/rsa-mlisa-rbac/users/profile')
  if (user.status === 401) {
    showExpiredSessionModal()
  } else {
    setUserProfile(await(user).json())
  }
  root.render(
    <React.StrictMode>
      <Provider>
        <LocaleProvider>
          <PreferredLangConfigProvider>
            <BrowserRouter>
              <React.Suspense fallback={null}>
                <AllRoutes />
              </React.Suspense>
            </BrowserRouter>
          </PreferredLangConfigProvider>
        </LocaleProvider>
      </Provider>
    </React.StrictMode>
  )
  renderPendo(() => getPendoConfig())
}