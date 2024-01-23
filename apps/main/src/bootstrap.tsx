import React, { useEffect, useState } from 'react'

import { Root }          from 'react-dom/client'
import { addMiddleware } from 'redux-dynamic-middlewares'

import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { useGetPreferencesQuery } from '@acx-ui/rc/services'
import { AdministrationUrlsInfo } from '@acx-ui/rc/utils'
import { BrowserRouter }          from '@acx-ui/react-router-dom'
import { Provider }               from '@acx-ui/store'
import {
  UserProfileProvider,
  useUserProfileContext,
  UserUrlsInfo,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation
} from '@acx-ui/user'
import {
  renderPendo,
  getTenantId,
  createHttpRequest,
  useLocaleContext,
  LangKey,
  DEFAULT_SYS_LANG
} from '@acx-ui/utils'
import type { PendoParameters } from '@acx-ui/utils'

import AllRoutes from './AllRoutes'
import { showBrowserLangDialog,
  detectBrowserLang,
  PartialUserData,
  isNonProdEnv } from './BrowserDialog/BrowserDialog'
import { errorMiddleware }        from './errorMiddleware'
import { refreshTokenMiddleware } from './refreshTokenMiddleware'

import '@acx-ui/theme'

async function pendoInitalization (): Promise<PendoParameters> {
  const tenantId = getTenantId()
  const userProfileRequest = createHttpRequest(UserUrlsInfo.getUserProfile, { tenantId })
  const res = await fetch(userProfileRequest.url, userProfileRequest)
  const user = await res.json()
  const tenantDetailRequest =
    createHttpRequest(AdministrationUrlsInfo.getTenantDetails, { tenantId })
  const resTenant = await fetch(tenantDetailRequest.url, tenantDetailRequest)
  const tenant = await resTenant.json()

  return {
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
      name: user.companyName,
      sfdcId: tenant.externalId
    }
  }
}

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const result = useGetUserProfileQuery({})
  const { data: userProfile } = result
  const request = useGetPreferencesQuery({ tenantId: getTenantId() })
  const defaultLang = (request.data?.global?.defaultLanguage || DEFAULT_SYS_LANG) as LangKey
  const tenantId = getTenantId()

  const [language, setLanguage] = useState(userProfile?.preferredLanguage?? defaultLang)
  const [langLoading, setLangLoading] = useState(true)
  const [ updateUserProfile ] = useUpdateUserProfileMutation()

  useEffect(() => {
    if (userProfile && isNonProdEnv()) {
      const userLang = userProfile?.preferredLanguage
      const browserLang = detectBrowserLang()
      const browserCacheLang = localStorage.getItem('browserLang')
      const openDialog = browserLang !== DEFAULT_SYS_LANG
        && browserLang !== userLang
        && browserLang !== browserCacheLang

      if (openDialog && isNonProdEnv()) {
        const userPreflang = showBrowserLangDialog()
        userPreflang.then((dialogResult) => {
          // update user profile - 'yes' language change
          if (dialogResult.lang !== '') {
            setLanguage(dialogResult.lang)
            const data:PartialUserData = {
              detailLevel: userProfile?.detailLevel,
              dateFormat: userProfile?.dateFormat,
              preferredLanguage: dialogResult.lang
            }
            try {
              updateUserProfile({
                payload: data,
                params: { tenantId }
              }).unwrap()
              setLangLoading(false)
            } catch (error) {
              console.log(error) // eslint-disable-line no-console
            } finally {
              setLangLoading(false)
            }
          }
        }).catch(() => {
          // user selected 'no' language change
          setLanguage(userProfile?.preferredLanguage?? defaultLang)
          setLangLoading(false)
        })
      } else {
        setLanguage(userProfile?.preferredLanguage?? defaultLang)
        setLangLoading(false)
      }
    }
  }, [ userProfile, defaultLang, tenantId, updateUserProfile ])

  const lang = language

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter/>}
    states={[{
      isLoading: result.isLoading || result.isFetching
        || request.isLoading || request.isFetching
        || langLoading
    }]}
    children={<ConfigProvider {...props} lang={lang as unknown as LangKey}/>}
  />
}

function DataGuardLoader (props: React.PropsWithChildren) {
  const locale = useLocaleContext()
  const userProfile = useUserProfileContext()

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading:
        !Boolean(locale.messages) ||
        !Boolean(userProfile.allowedOperations.length) ||
        !Boolean(userProfile.accountTier)
    }]}
    children={props.children}
  />
}

export async function init (root: Root) {
  renderPendo(pendoInitalization)
  addMiddleware(refreshTokenMiddleware, errorMiddleware)
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
