import React from 'react'

import { createRoot } from 'react-dom/client'

import { ConfigProvider, ConfigProviderProps } from '@acx-ui/components'
import { BrowserRouter }                       from '@acx-ui/react-router-dom'
import { Provider }                            from '@acx-ui/store'

import AllRoutes from './AllRoutes'

import '@acx-ui/theme'

// Needed for Browser language detection
export function loadMessages (locale: string) {
  switch (locale) {
    case 'en':
    case 'en-US':
      return 'en-US'
    case 'de':
    case 'de-DE':
      return 'de-DE'
    case 'ja':
    case 'ja-JP':
      return 'ja-JP'
    default:
      return 'en-US'
  }
}

export async function init () {
  const container = document.getElementById('root')
  const root = createRoot(container!)
  const browserLang = loadMessages(navigator.language)
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
