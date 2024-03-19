import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { AdminSolid }                               from '@acx-ui/icons'
import { HomeSolid }                                from '@acx-ui/icons'
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
import { useGetTenantDetailQuery, useMspEntitlementListQuery }                      from '@acx-ui/msp/services'
import { CloudMessageBanner }                                                       from '@acx-ui/rc/components'
import { ConfigTemplateContext }                                                    from '@acx-ui/rc/utils'
import { Outlet, useParams, useNavigate, useTenantLink, TenantNavLink, TenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                          from '@acx-ui/user'
import { getJwtTokenPayload, isDelegationMode, AccountType }                        from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'

function Layout () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [tenantType, setTenantType] = useState('')
  const [hasLicense, setHasLicense] = useState(false)
  const [isDogfood, setDogfood] = useState(false)
  const [supportStatus,setSupportStatus] = useState('')
  const basePath = useTenantLink('/users/guestsManager')
  const dpskBasePath = useTenantLink('/users/dpskAdmin')
  const navigate = useNavigate()
  const params = useParams()
  const isBrand360Enabled = useIsSplitOn(Features.MSP_BRAND_360)
  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn
  const { data } = useGetTenantDetailQuery({ params: { tenantId } })
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const { data: mspEntitlement } = useMspEntitlementListQuery({ params })
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const nonVarDelegation = useIsSplitOn(Features.ANY_3RDPARTY_INVITE_TOGGLE)
  const showSupportHomeButton = isSupportToMspDashboardAllowed && isDelegationMode()

  const isShowBrand360 =
    isBrand360Enabled &&
    (tenantType === AccountType.MSP_INTEGRATOR ||
    tenantType === AccountType.MSP_NON_VAR)

  const indexPath = isGuestManager
    ? '/users/guestsManager'
    : isShowBrand360
      ? '/brand360'
      : '/dashboard'

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

  useEffect(() => {
    if (data && userProfile) {
      const isRecDelegation = nonVarDelegation && data.tenantType === AccountType.REC
      if (!isSupportToMspDashboardAllowed &&
        (userProfile?.support || userProfile?.dogfood || isRecDelegation)) {
        setTenantType('SUPPORT')
      } else {
        setTenantType(data.tenantType)
      }
      setDogfood((userProfile?.dogfood && !userProfile?.support) || isRecDelegation)
    }
    if (mspEntitlement?.length && mspEntitlement?.length > 0) {
      setHasLicense(true)
    }
  }, [data, userProfile, mspEntitlement])

  return (
    <LayoutComponent
      logo={<TenantNavLink to={indexPath} tenantType={'v'} children={<Logo />} />}
      menuConfig={useMenuConfig(tenantType, hasLicense, isDogfood, data?.mspEc?.parentMspId)}
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
        { showSupportHomeButton && (
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

export default Layout

export function LayoutWithConfigTemplateContext () {
  return <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
    <Outlet />
  </ConfigTemplateContext.Provider>
}
