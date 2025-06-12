import React from 'react'

import { Root } from 'react-dom/client'

import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { SplitProvider }                      from '@acx-ui/feature-toggle'
import { TenantDetail }                       from '@acx-ui/msp/utils'
import { useGetPreferencesQuery }             from '@acx-ui/rc/services'
import { AdministrationUrlsInfo, TenantType } from '@acx-ui/rc/utils'
import { BrowserRouter }                      from '@acx-ui/react-router-dom'
import { Provider, dynamicMiddleware }        from '@acx-ui/store'
import {
  UserProfileProvider,
  useUserProfileContext,
  UserUrlsInfo } from '@acx-ui/user'
import {
  renderPendo,
  getTenantId,
  createHttpRequest,
  useLocaleContext,
  LangKey,
  DEFAULT_SYS_LANG,
  initializeSockets,
  LoadTimeProvider
} from '@acx-ui/utils'
import type { PendoParameters } from '@acx-ui/utils'

import AllRoutes           from './AllRoutes'
import { errorMiddleware } from './errorMiddleware'

import '@acx-ui/theme'

async function pendoInitalization (): Promise<PendoParameters> {
  const tenantId = getTenantId()
  const userProfileRequest = createHttpRequest(UserUrlsInfo.getUserProfile, { tenantId })
  const res = await fetch(userProfileRequest.url, userProfileRequest)
  const user = await res.json()
  const tenantDetailRequest =
    createHttpRequest(AdministrationUrlsInfo.getTenantDetails, { tenantId })
  const resTenant = await fetch(tenantDetailRequest.url, tenantDetailRequest)
  const tenant = await resTenant.json() as TenantDetail

  return {
    visitor: {
      id: user.externalId,
      full_name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      version: user.pver,
      var: tenant.tenantType === TenantType.VAR,
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
      name: user.companyName,
      sfdcId: tenant.externalId
    }
  }
}

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const tenantId = getTenantId()
  const { data: userProfile, isUserProfileLoading } = useUserProfileContext()

  const request = useGetPreferencesQuery({ tenantId })
  const defaultLang = request.data?.global?.defaultLanguage as LangKey || DEFAULT_SYS_LANG
  const preferredLanguage = userProfile?.preferredLanguage as LangKey || defaultLang

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter/>}
    states={[{
      isLoading: isUserProfileLoading || request.isFetching
    }]}
    children={<ConfigProvider {...props} lang={preferredLanguage}/>}
  />
}

function DataGuardLoader (props: React.PropsWithChildren) {
  const locale = useLocaleContext()
  const userProfile = useUserProfileContext()
  const rbacOpsApiEnabled = userProfile.rbacOpsApiEnabled

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading:
        !Boolean(locale.messages) ||
        (rbacOpsApiEnabled ? !Boolean(userProfile.allowedOperations.length) : false) ||
        !Boolean(userProfile.accountTier)
    }]}
    children={props.children}
  />
}

export async function init (root: Root) {
  renderPendo(pendoInitalization)
  dynamicMiddleware.addMiddleware(errorMiddleware)
  initializeSockets()

  root.render(
    <React.StrictMode>
      <Provider>
        <BrowserRouter>
          <UserProfileProvider>
            <SplitProvider>
              <PreferredLangConfigProvider>
                <DataGuardLoader>
                  <React.Suspense fallback={null}>
                    <LoadTimeProvider>
                      <AllRoutes />
                    </LoadTimeProvider>
                  </React.Suspense>
                </DataGuardLoader>
              </PreferredLangConfigProvider>
            </SplitProvider>
          </UserProfileProvider>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  )
}
