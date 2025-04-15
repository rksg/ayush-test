import React from 'react'

import { Root } from 'react-dom/client'

import { showExpiredSessionModal }                        from '@acx-ui/analytics/components'
import { getPendoConfig, getUserProfile, setUserProfile } from '@acx-ui/analytics/utils'
import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { SplitProvider }               from '@acx-ui/feature-toggle'
import { BrowserRouter }               from '@acx-ui/react-router-dom'
import { Provider, dynamicMiddleware } from '@acx-ui/store'
import {
  renderPendo,
  useLocaleContext,
  LangKey,
  getJwtHeaders,
  userLogout
} from '@acx-ui/utils'

import AllRoutes           from './AllRoutes'
import { errorMiddleware } from './errorMiddleware'

import '@acx-ui/theme'

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const { preferences, userId } = getUserProfile()
  const preferredLanguage = preferences?.preferredLanguage || 'en-US'
  const { children } = props
  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading: !Boolean(userId) }]}
    children={<ConfigProvider children={children} lang={preferredLanguage as LangKey} />}
  />
}

function DataGuardLoader (props: React.PropsWithChildren) {
  const locale = useLocaleContext()

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading: !Boolean(locale.messages) }]}
    children={props.children}
  />
}

export async function init (root: Root) {
  dynamicMiddleware.addMiddleware(errorMiddleware)
  const user = await fetch('/analytics/api/rsa-mlisa-rbac/users/profile',
    { headers: { ...getJwtHeaders() } })
  if (user.status === 401) {
    window.location.hostname === 'localhost'
      ? showExpiredSessionModal()
      : userLogout()
  } else {
    setUserProfile(await(user).json())
  }

  root.render(
    <React.StrictMode>
      <Provider>
        <BrowserRouter>
          <SplitProvider>
            <PreferredLangConfigProvider>
              <DataGuardLoader>
                <React.Suspense fallback={null}>
                  <AllRoutes />
                </React.Suspense>
              </DataGuardLoader>
            </PreferredLangConfigProvider>
          </SplitProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  )

  renderPendo(() => getPendoConfig())
}
