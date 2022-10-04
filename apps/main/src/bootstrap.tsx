import React from 'react'

import { createRoot } from 'react-dom/client'

import { ConfigProvider, ConfigProviderProps } from '@acx-ui/components'
import { get }                                 from '@acx-ui/config'
import { BrowserRouter }                       from '@acx-ui/react-router-dom'
import { Provider }                            from '@acx-ui/store'

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
    'initialize': { };
  }
  function pendoInitalization (): void
}
export function loadMessages (locales: readonly string[]): string {
  const locale = locales.find(locale =>
    supportedLocales[locale as keyof typeof supportedLocales]) || 'en-US'
  return supportedLocales[locale as keyof typeof supportedLocales]
}

function getTenantId () {
  /* eslint-disable */
  const chunks = location.pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) { return chunks[Number(c) + 1] }
  }
  return
}
export function renderPendoAnalyticsTag () {
  const script = document.createElement('script')
  const key = get('PENDO_API_KEY')
  script.onerror = event => {
    /* eslint-disable */  // Disables everything from this point down
    console.log('Failed to load pendo api key from env', event)
  }
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
// this is wip need to add more pendo attributes below 
export function pendoInitalization (): void {
  const tenantId = getTenantId()
  if (window.pendo) {
    window.pendo.initialize = {
      visitor: {
        id: tenantId
      }
    }
    /* eslint-disable no-console */
    console.log('Pendo initialize !! ', window.pendo.initialize)
  }
}

export async function init () {
  const container = document.getElementById('root')
  const root = createRoot(container!)
  const browserLang = loadMessages(navigator.languages)
  const queryParams = new URLSearchParams(window.location.search)
  const lang = (queryParams.get('lang') ?? browserLang) as ConfigProviderProps['lang']

  // Pendo initialization
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
