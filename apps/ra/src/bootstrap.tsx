import React from 'react'

import { Root } from 'react-dom/client'

import { UserProfileProvider } from '@acx-ui/analytics/utils'
import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { get }           from '@acx-ui/config'
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
import type { PendoParameters } from '@acx-ui/utils'

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

async function pendoInitalization (): Promise<PendoParameters> {
  const user = await (await fetch('/analytics/api/rsa-mlisa-rbac/users/profile')).json()
  const tenant = user.tenants.find(({ id }: { id: string }) => id === user.accountId) // TODO use selected tenant
  return {
    visitor: {
      id: user.userId,
      full_name: `${user.firstName} ${user.lastName}`,
      role: tenant.role,
      region: get('MLISA_REGION'),
      version: get('MLISA_VERSION'),
      varTenantId: user.accountId,
      support: tenant.support,
      delegated: user.accountId !== tenant.id,
      email: user.email
    },
    account: {
      productName: 'RuckusAI',
      id: tenant.id,
      name: tenant.name,
      isTrial: tenant.isTrial
    }
  }
}

export async function init (root: Root) {
  renderPendo(pendoInitalization)
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