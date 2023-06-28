import React from 'react'

import { Root } from 'react-dom/client'

import { UserProfileProvider } from '@acx-ui/analytics/utils'
import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { BrowserRouter } from '@acx-ui/react-router-dom'
import { Provider }      from '@acx-ui/store'
import {
  useLocaleContext,
  LangKey,
  DEFAULT_SYS_LANG,
  LocaleProvider,
  setUpIntl
} from '@acx-ui/utils'

import AllRoutes from './AllRoutes'

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

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const { lang } = useLocaleContext()
  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    children={<ConfigProvider {...props} lang={loadMessages([lang])} />}
  />
}

export async function init (root: Root) {
  setUpIntl({ locale: 'en-US' })
  root.render(
    <React.StrictMode>
      <Provider>
        <LocaleProvider>
          <PreferredLangConfigProvider>
            <UserProfileProvider>
              <BrowserRouter>
                <React.Suspense fallback={null}>
                  <AllRoutes />
                </React.Suspense>
              </BrowserRouter>
            </UserProfileProvider>
          </PreferredLangConfigProvider>
        </LocaleProvider>
      </Provider>
    </React.StrictMode>
  )
}