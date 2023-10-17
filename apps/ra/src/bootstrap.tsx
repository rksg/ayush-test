import React from 'react'

import { Root } from 'react-dom/client'

import { getPendoConfig, setUserProfile } from '@acx-ui/analytics/utils'
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
  const { children } = props
  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    children={<ConfigProvider children={children} lang={loadMessages([lang])} />}
  />
}

export async function init (root: Root) {
  const user = await (await fetch('/analytics/api/rsa-mlisa-rbac/users/profile')).json()
  setUserProfile(user)
  setUpIntl({ locale: 'en-US' })
  root.render(
    <React.StrictMode>
      <Provider>
        <LocaleProvider>
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