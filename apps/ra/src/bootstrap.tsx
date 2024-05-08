import React from 'react'

import { Root }          from 'react-dom/client'
import { addMiddleware } from 'redux-dynamic-middlewares'

import { showExpiredSessionModal }                        from '@acx-ui/analytics/components'
import { getPendoConfig, getUserProfile, setUserProfile } from '@acx-ui/analytics/utils'
import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'
import {
  renderPendo,
  useLocaleContext,
  LocaleProvider,
  setUpIntl,
  LangKey,
  getJwtHeaders
} from '@acx-ui/utils'

import AllRoutes           from './AllRoutes'
import { errorMiddleware } from './errorMiddleware'

import '@acx-ui/theme'

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const { lang } = useLocaleContext()
  const { children } = props
  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    children={<ConfigProvider children={children} lang={lang} />}
  />
}

export async function init (root: Root) {
  addMiddleware(errorMiddleware)
  const user = await fetch('/analytics/api/rsa-mlisa-rbac/users/profile', {
    headers: { ...getJwtHeaders() }
  })
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
