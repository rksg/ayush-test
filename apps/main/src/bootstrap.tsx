import React from 'react'

import { createRoot } from 'react-dom/client'

import { ConfigProvider, ConfigProviderProps } from '@acx-ui/components'
import { BrowserRouter }                       from '@acx-ui/react-router-dom'
import { Provider }                            from '@acx-ui/store'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

// Needed for Browser language detection
export function loadMessages (locales: readonly string[]): string {
  let browserLang = ''
  for(let i = 0; i < locales.length; i++) {
    switch (locales[i]) {
      case 'en':
      case 'en-US':
        browserLang = 'en-US'
        break
      case 'de':
      case 'de-DE':
        browserLang = 'de-DE'
        break
      case 'ja':
      case 'ja-JP':
        browserLang = 'ja-JP'
        break
    }
    if (browserLang) break
  }
  if (!browserLang) browserLang = 'en-US'
  return browserLang
}

export async function init () {
  const container = document.getElementById('root')
  const root = createRoot(container!)
  const browserLang = loadMessages(navigator.languages)
  const queryParams = new URLSearchParams(window.location.search)
  const lang = (queryParams.get('lang') ?? browserLang) as ConfigProviderProps['lang']

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
