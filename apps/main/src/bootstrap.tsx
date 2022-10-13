import React from 'react'

import { createRoot } from 'react-dom/client'

import { ConfigProvider, ConfigProviderProps } from '@acx-ui/components'
import { get }                                 from '@acx-ui/config'
import {
  CommonUrlsInfo,
  createHttpRequest
} from '@acx-ui/rc/utils'
import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'
import { getJwtTokenPayload } from '@acx-ui/utils'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

// Needed for Browser language detection
const supportedLocales = {
  'en-US': 'en-US',
  'en': 'en-US',
  'de-DE': 'de-DE',
  'de': 'de-DE',
  'ja-JP': 'ja-JP',
  'ja': 'ja-JP'
}
declare global {
  /* eslint-disable no-var */
  var pendo: {
    initialize(init: Record<string, Record<string, string | boolean>>): void
  }
  function pendoInitalization (): void
}
export function loadMessages (locales: readonly string[]): string {
  const locale = locales.find(locale =>
    supportedLocales[locale as keyof typeof supportedLocales]) || 'en-US'
  return supportedLocales[locale as keyof typeof supportedLocales]
}

function getTenantId () {
  const chunks = window.location.pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) + 1] }
  }
  return
}
export function renderPendoAnalyticsTag () {
  const script = document.createElement('script')
  // @ts-ignore
  const key = get('PENDO_API_KEY')
  script.onerror = event => {
    /* eslint-disable */  // Disables everything from this point down
    console.log('Failed to load pendo api key from env', event)
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
  const param = { tenantId }
  const userUrl = createHttpRequest (
    CommonUrlsInfo.getUserProfile,
    param
  )

  const url = userUrl.url
  try {
    const res = await fetch(url)
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
        delegated: user.tenantId !== user.varTenantId
      },
      account: {
        id: user.tenantId,
        name: user.companyName
      }
    })
  } catch (error) {
    /* eslint-disable no-console */
    console.log(error)
  }
}

export async function init () {
  const container = document.getElementById('root')
  const root = createRoot(container!)
  const browserLang = loadMessages(navigator.languages)
  const queryParams = new URLSearchParams(window.location.search)
  const lang = (queryParams.get('lang') ?? browserLang) as ConfigProviderProps['lang']
  const jwtPayload = getJwtTokenPayload()
  console.log('JWT Payload :', jwtPayload)
  console.log('JWT Payload :', jwtPayload.acx_account_tier)
  console.log('JWT Payload :', jwtPayload.acx_account_regions[2])
  console.log('JWT Payload :', jwtPayload.region)
  console.log('JWT Payload :', jwtPayload.acx_account_vertical)

  // Pendo initialization
  // @ts-ignore
  if ( get('DISABLE_PENDO') === 'false' ) {
    renderPendoAnalyticsTag()
  }

  root.render(
    <React.StrictMode>
      <ConfigProvider lang={lang}>
        <Provider>
          <BrowserRouter>
            <React.Suspense fallback={null}>
              <AllRoutes />
            </React.Suspense>
          </BrowserRouter>
        </Provider>
      </ConfigProvider>
    </React.StrictMode>
  )
}
