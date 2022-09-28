import React from 'react'

import { createRoot } from 'react-dom/client'

import { ConfigProvider, ConfigProviderProps } from '@acx-ui/components'
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
export function loadMessages (locales: readonly string[]): string {
  const locale = locales.find(locale => 
    supportedLocales[locale as keyof typeof supportedLocales]) || 'en-US'
  return supportedLocales[locale as keyof typeof supportedLocales]
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
