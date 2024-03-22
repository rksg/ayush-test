import React from 'react'

import { Root }          from 'react-dom/client'
import { addMiddleware } from 'redux-dynamic-middlewares'

import { getPendoConfig, getUserProfile, setUserProfile } from '@acx-ui/analytics/utils'
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
  LocaleProvider,
  setUpIntl,
  getIntl,
  LangKey
} from '@acx-ui/utils'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'
import type { AnyAction } from '@reduxjs/toolkit'

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const { lang } = useLocaleContext()
  const { children } = props
  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    children={<ConfigProvider children={children} lang={lang} />}
  />
}

export function showExpiredSessionModal () {
  try {
    getIntl()
  } catch {
    setUpIntl({ locale: 'en-US' })
  }
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
  const user = await fetch('/analytics/api/rsa-mlisa-rbac/users/profile')
  if (user.status === 401) {
    showExpiredSessionModal()
  } else {
    setUserProfile(await(user).json())
  }
  const { preferences } = getUserProfile()
  const preferredLanguage = preferences?.preferredLanguage || 'en-US'
  setUpIntl({ locale: preferredLanguage })
  root.render(
    <React.StrictMode>
      <Provider>
        <LocaleProvider lang={preferredLanguage as LangKey}>
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
