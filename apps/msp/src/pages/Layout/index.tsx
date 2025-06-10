import { useContext, useEffect, useRef, useState } from 'react'

import { Typography } from 'antd'
import _              from 'lodash'
import { useIntl }    from 'react-intl'

import { useBrand360Config } from '@acx-ui/analytics/services'
import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { baseUrlFor }                               from '@acx-ui/config'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { AdminSolid, HomeSolid }                    from '@acx-ui/icons'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HelpButton,
  UserButton,
  LicenseBanner,
  HeaderContext,
  RegionButton
} from '@acx-ui/main/components'
import { useGetBrandingDataQuery, useGetTenantDetailQuery, useMspEntitlementListQuery } from '@acx-ui/msp/services'
import { AssignedEntitlementListPayload }                                               from '@acx-ui/msp/utils'
import { CloudMessageBanner }                                                           from '@acx-ui/rc/components'
import { useRbacEntitlementListQuery }                                                  from '@acx-ui/rc/services'
import { ConfigTemplateContext, SaveEnforcementConfigFnType }                           from '@acx-ui/rc/utils'
import { Outlet, useParams, useNavigate, useTenantLink, TenantNavLink, TenantLink }     from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                    from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                              from '@acx-ui/user'
import { getJwtTokenPayload, isDelegationMode, AccountType, AccountVertical }           from '@acx-ui/utils'

import HspContext from '../../HspContext'

import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'

function Layout () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [tenantType, setTenantType] = useState('')
  const [hasLicense, setHasLicense] = useState(false)
  const [isDogfood, setDogfood] = useState(false)
  const [isOnboardMsp, setOnboardMsp] = useState(false)
  const [supportStatus,setSupportStatus] = useState('')
  const basePath = useTenantLink('/users/guestsManager')
  const dpskBasePath = useTenantLink('/users/dpskAdmin')
  const reportsAdminBasePath = useTenantLink('/dataStudio')
  const navigate = useNavigate()
  const params = useParams()
  const brand360PLMEnabled = useIsTierAllowed(Features.MSP_HSP_360_PLM_FF)
  const isBrand360Enabled = useIsSplitOn(Features.MSP_BRAND_360) && brand360PLMEnabled
  const { names: { brand } } = useBrand360Config()
  const { data } = useGetTenantDetailQuery({ params: { tenantId } })
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isReportsAdmin = hasRoles([RolesEnum.REPORTS_ADMIN])
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const isHospitality = getJwtTokenPayload().acx_account_vertical === AccountVertical.HOSPITALITY
  const showSupportHomeButton = isSupportToMspDashboardAllowed && isDelegationMode()
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isRbacEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE)
  const { data: mspEntitlement } = useMspEntitlementListQuery({ params },
    { skip: isEntitlementRbacApiEnabled })
  const { data: rbacMspEntitlement } = useRbacEntitlementListQuery(
    { params: useParams(), payload: AssignedEntitlementListPayload },
    { skip: !isEntitlementRbacApiEnabled })

  const {
    state
  } = useContext(HspContext)
  const { isHsp: isHspSupportEnabled } = state

  const isShowBrand360 =
    isBrand360Enabled &&
    (tenantType === AccountType.MSP_INTEGRATOR ||
    tenantType === AccountType.MSP_NON_VAR)

  const isTechPartner =
    tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER
  const { data: mspBrandData } = useGetBrandingDataQuery({ params, enableRbac: isRbacEnabled },
    { skip: !isTechPartner })

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
    if (isReportsAdmin && params['*'] !== 'dataStudio') {
      navigate({
        ...reportsAdminBasePath,
        pathname: `${reportsAdminBasePath.pathname}`
      })
    }
  }, [isGuestManager, isDPSKAdmin, isReportsAdmin, params['*']])

  useEffect(() => {
    if (data && userProfile) {
      const isRecDelegation = data.tenantType === AccountType.REC
      if (!isSupportToMspDashboardAllowed &&
        (userProfile?.support || userProfile?.dogfood || isRecDelegation)) {
        setTenantType('SUPPORT')
      } else {
        setTenantType(data.tenantType)
      }
      setDogfood((userProfile?.dogfood && !userProfile?.support) || isRecDelegation)
      setOnboardMsp(data.msp?.mspLabel ? true : false)
    }
    if (_.isEmpty(mspEntitlement) || _.isEmpty(rbacMspEntitlement?.data)) {
      setHasLicense(true)
    }
  }, [data, userProfile, mspEntitlement])

  return (
    <LayoutComponent
      logo={<TenantNavLink
        to={indexPath}
        tenantType={'v'}
        children={<img
          src={baseUrlFor('/assets/Logo.svg')}
          alt='logo'
          width={180}
          height={60}
        />} />}
      menuConfig={useMenuConfig(tenantType, hasLicense, isDogfood, isOnboardMsp)}
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
        { isHospitality && !brand.includes('MDU') &&
          <UI.VerticalTitle>
            <Typography.Title level={3}>
              {$t({ defaultMessage: 'Hospitality Edition' })}
            </Typography.Title>
          </UI.VerticalTitle>}
      </>}
      rightHeaderContent={<>
        <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>
        {!(isGuestManager || isDPSKAdmin) &&
          <>
            <AlarmsButton/>
            <ActivityButton/>
          </>}
        <FetchBot showFloatingButton={false} statusCallback={setSupportStatus}/>
        <HelpButton
          isMspEc={isTechPartner}
          mspBrandData={mspBrandData}
          supportStatus={supportStatus}/>
        <UserButton/>
      </>}
    />
  )
}

export default Layout

export function LayoutWithConfigTemplateContext () {
  const saveEnforcementConfigFnRef = useRef<SaveEnforcementConfigFnType>()

  const setSaveEnforcementConfigFn = (fn: SaveEnforcementConfigFnType) => {
    saveEnforcementConfigFnRef.current = fn
  }

  const saveEnforcementConfig = async (templateId: string) => {
    if (templateId && saveEnforcementConfigFnRef.current) {
      await saveEnforcementConfigFnRef.current(templateId)
    }
  }

  return <ConfigTemplateContext.Provider
    value={{ isTemplate: true, setSaveEnforcementConfigFn, saveEnforcementConfig }}>
    <Outlet />
  </ConfigTemplateContext.Provider>
}
