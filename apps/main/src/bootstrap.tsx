import React from 'react'

import { Root }          from 'react-dom/client'
import { addMiddleware } from 'redux-dynamic-middlewares'

import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
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
  getTenantId,
  createHttpRequest,
  useLocaleContext,
  LangKey,
  DEFAULT_SYS_LANG
} from '@acx-ui/utils'

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
declare global {
  /* eslint-disable no-var */
  var pendo: {
    initialize(init: Record<string, Record<string, string | boolean>>): void
  }
  function pendoInitalization (): void
}
export function loadMessages (locales: readonly string[]): LangKey {
  const locale = locales.find(locale =>
    supportedLocales[locale as keyof typeof supportedLocales]) || DEFAULT_SYS_LANG
  return supportedLocales[locale as keyof typeof supportedLocales]
}

export function renderPendoAnalyticsTag () {
  const script = document.createElement('script')
  script.defer = true
  // @ts-ignore
  const key = get('PENDO_API_KEY')
  script.onerror = event => {
    /* eslint-disable */  // Disables everything from this point down
    console.error('Failed to load pendo api key from env', event)
  }
  // Installing Pendo snippet
  const scriptText = `(function(apiKey){
                      (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=[];
                        v=['initialize','identify','updateOptions','pageLoad'];for(w=0,x=v.length;w<x;++w)(function(m){
                        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
                        y=e.createElement(n);y.async=!0;y.onload=window.pendoInitalization;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
                        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
                      })('${key}');`
  /* eslint-enable */
  const inlineScript = document.createTextNode(scriptText)
  script.appendChild(inlineScript)
  window.pendoInitalization = pendoInitalization
  document.body.appendChild(script)
}

export async function pendoInitalization (): Promise<void> {
  const tenantId = getTenantId()
  const userProfileRequest = createHttpRequest(UserUrlsInfo.getUserProfile, { tenantId })
  const url = userProfileRequest.url

  try {
    const res = await fetch(url, userProfileRequest)
    const user = await res.json()
    window.pendo.initialize({
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
    })
  } catch (error) {
    /* eslint-disable no-console */
    console.error(error)
  }
}

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const result = useGetUserProfileQuery({})
  const { data: userProfile } = result
  const request = useGetPreferencesQuery({ tenantId: getTenantId() })
  const userPreflang = String(userProfile?.preferredLanguage) as LangKey
  const defaultLang = String(request.data?.global?.defaultLanguage) as LangKey

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
  // Pendo initialization
  // @ts-ignore
  if ( get('DISABLE_PENDO') === 'false' ) {
    renderPendoAnalyticsTag()
  }

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
