import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { Features, SplitProvider, useIsSplitOn } from '@acx-ui/feature-toggle'
import { AdminSolid }                            from '@acx-ui/icons'
import { HomeSolid }                             from '@acx-ui/icons'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HelpButton,
  UserButton,
  LicenseBanner,
  Logo,
  HeaderContext,
  RegionButton
} from '@acx-ui/main/components'
import { CloudMessageBanner }                                                       from '@acx-ui/rc/components'
import { ConfigTemplateContext }                                                    from '@acx-ui/rc/utils'
import { Outlet, useParams, useNavigate, useTenantLink, TenantNavLink, TenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                          from '@acx-ui/user'
import { PverName, getJwtTokenPayload, isDelegationMode }                           from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'

function Layout () {
  const { $t } = useIntl()
  const [supportStatus,setSupportStatus] = useState('')
  const basePath = useTenantLink('/users/guestsManager')
  const dpskBasePath = useTenantLink('/users/dpskAdmin')
  const navigate = useNavigate()
  const params = useParams()
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT)
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName

  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const indexPath = isGuestManager ? '/users/guestsManager' : '/dashboard'
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()

  const showSupportHomeButton = isSupportToMspDashboardAllowed && isDelegationMode()
  const isBackToRC = (PverName.ACX === getJwtTokenPayload().pver ||
    PverName.ACX_HYBRID === getJwtTokenPayload().pver)

  useEffect(() => {
    if (isGuestManager && params['*'] !== 'guestsManager') {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}`
      })
    }
    if (isDPSKAdmin && params['*'] !== 'dpskAdmin') {
      navigate({
        ...dpskBasePath,
        pathname: `${dpskBasePath.pathname}`
      })
    }
  }, [isGuestManager, isDPSKAdmin, params['*']])

  return (
    <LayoutComponent
      logo={<TenantNavLink to={indexPath} tenantType={'v'} children={<Logo />} />}
      menuConfig={useMenuConfig()}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={<>
        {isHspSupportEnabled && <TenantLink to='/dashboard'>
          <UI.Home>
            <LayoutUI.Icon children={<AdminSolid />} />
            {$t({ defaultMessage: 'My Account' })}
          </UI.Home></TenantLink>}
        { showSupportHomeButton && (isBackToRC ?
          <a href={`/api/ui/v/${getJwtTokenPayload().tenantId}`}>
            <UI.Home>
              <LayoutUI.Icon children={<HomeSolid />} />
              {$t({ defaultMessage: 'Support Home' })}
            </UI.Home>
          </a> :
          <a href={`/${getJwtTokenPayload().tenantId}/v/dashboard`}>
            <UI.Home>
              <LayoutUI.Icon children={<HomeSolid />} />
              {$t({ defaultMessage: 'Support Home' }) }
            </UI.Home>
          </a>)
        }
        <RegionButton/>
        <HeaderContext.Provider value={{ licenseExpanded, setLicenseExpanded }}>
          <LicenseBanner isMSPUser={true}/>
        </HeaderContext.Provider>
      </>}
      rightHeaderContent={<>
        <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>
        {!(isGuestManager || isDPSKAdmin) &&
          <>
            <AlarmsButton/>
            <ActivityButton/>
          </>}
        <FetchBot showFloatingButton={false} statusCallback={setSupportStatus}/>
        <HelpButton supportStatus={supportStatus}/>
        <UserButton/>
      </>}
    />
  )
}

function LayoutWithSplitProvider () {
  return <SplitProvider>
    <Layout />
  </SplitProvider>
}

export default LayoutWithSplitProvider

export function LayoutWithConfigTemplateContext () {
  return <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
    <Outlet />
  </ConfigTemplateContext.Provider>
}
