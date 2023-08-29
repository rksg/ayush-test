import React from 'react'

import { Root }          from 'react-dom/client'
import { addMiddleware } from 'redux-dynamic-middlewares'

import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { useGetPreferencesQuery } from '@acx-ui/rc/services'
import { BrowserRouter }          from '@acx-ui/react-router-dom'
import { Provider }               from '@acx-ui/store'
import {
  UserProfileProvider,
  useUserProfileContext,
  UserUrlsInfo,
  useGetUserProfileQuery
} from '@acx-ui/user'
import {
  renderPendo,
  getTenantId,
  createHttpRequest,
  useLocaleContext,
  LangKey,
  DEFAULT_SYS_LANG
} from '@acx-ui/utils'
import type { PendoParameters } from '@acx-ui/utils'

import AllRoutes           from './AllRoutes'
import { errorMiddleware } from './errorMiddleware'

import '@acx-ui/theme'

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
async function pendoInitalization (): Promise<PendoParameters> {
  const tenantId = getTenantId()
  const userProfileRequest = createHttpRequest(UserUrlsInfo.getUserProfile, { tenantId })
  const res = await fetch(userProfileRequest.url, userProfileRequest)
  const user = await res.json()
  return {
    visitor: {
      id: user.externalId,
      full_name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      version: user.pver,
      var: user.var,
      varTenantId: user.varTenantId,
      support: user.support,
      dogfood: user.dogfood,
      region: user.region,
      username: user.username,
      delegated: user.tenantId !== user.varTenantId,
      email: user.email
    },
    account: {
      productName: 'RuckusOne',
      id: user.tenantId,
      name: user.companyName
    }
  }
}

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const result = useGetUserProfileQuery({})
  const { data: userProfile } = result
  const request = useGetPreferencesQuery({ tenantId: getTenantId() })
  const userPreflang = String(userProfile?.preferredLanguage) as LangKey
  const defaultLang = (request.data?.global?.defaultLanguage || DEFAULT_SYS_LANG) as LangKey

  // this condition userPreflang !== DEFAULT_SYS_LANG is needed when FF is off
  // need to be cleaned up once FF acx-ui-i18n-phase2-toggle is globally enabled
  const lang = userPreflang !== DEFAULT_SYS_LANG? userPreflang : defaultLang
  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading: result.isLoading || result.isFetching
        || request.isLoading || request.isFetching }]}
    children={<ConfigProvider {...props} lang={lang} />}
  />
}

function DataGuardLoader (props: React.PropsWithChildren) {
  const locale = useLocaleContext()
  const userProfile = useUserProfileContext()

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading:
      !Boolean(locale.messages) ||
      !Boolean(userProfile.allowedOperations.length)
    }]}
    children={props.children}
  />
}

export async function init (root: Root) {
  renderPendo(pendoInitalization)
  addMiddleware(errorMiddleware)
  root.render(
    <React.StrictMode>
      <Provider>
        <PreferredLangConfigProvider>
          <BrowserRouter>
            <UserProfileProvider>
              <DataGuardLoader>
                <React.Suspense fallback={null}>
                  <AllRoutes />
                </React.Suspense>
              </DataGuardLoader>
            </UserProfileProvider>
          </BrowserRouter>
        </PreferredLangConfigProvider>
      </Provider>
    </React.StrictMode>
  )
}
