import { useEffect, useState } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { HomeSolid }              from '@acx-ui/icons'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HeaderContext,
  HelpButton,
  UserButton,
  LicenseBanner,
  RegionButton,
  GlobalSearchBar
} from '@acx-ui/main/components'
import {
  MspEcDropdownList
} from '@acx-ui/msp/components'
import { useGetBrandingDataQuery, useGetMspEcProfileQuery, useInviteCustomerListQuery }    from '@acx-ui/msp/services'
import { MSPUtils }                                                                        from '@acx-ui/msp/utils'
import { CloudMessageBanner }                                                              from '@acx-ui/rc/components'
import { useGetTenantDetailsQuery }                                                        from '@acx-ui/rc/services'
import { useTableQuery, dpskAdminRoutePathKeeper }                                         from '@acx-ui/rc/utils'
import { Outlet, useNavigate, useTenantLink, TenantNavLink, MspTenantLink, useLocation }   from '@acx-ui/react-router-dom'
import { useParams }                                                                       from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                       from '@acx-ui/types'
import { hasCrossVenuesPermission, hasRoles, useUserProfileContext }                       from '@acx-ui/user'
import { AccountType, AccountVertical, getJwtTokenPayload, isDelegationMode, useTenantId } from '@acx-ui/utils'

import RuckusAiButton from '../RuckusAiButton'

import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'
import { useLogo }       from './useLogo'

function Layout () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantId = useTenantId()
  const params = useParams()
  const location = useLocation()
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const isRbacEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE)
  const isOnboardingAssistantEnabled = useIsSplitOn(Features.RUCKUS_ONBOARDING_ASSISTANT_TOGGLE)
  const isCanvasEnabled = useIsSplitOn(Features.CANVAS)

  const logo = useLogo(tenantId)

  const { data: userProfile } = useUserProfileContext()
  const { data: tenantDetails } = useGetTenantDetailsQuery({ params })
  const { data: mspEcProfile } = useGetMspEcProfileQuery({ params })
  const isMspEc = MSPUtils().isMspEc(mspEcProfile)
  const { data: mspBrandData } = useGetBrandingDataQuery({ params, enableRbac: isRbacEnabled },
    { skip: !isMspEc })

  const companyName = userProfile?.companyName
  const tenantType = tenantDetails?.tenantType

  const invitationPayload = {
    searchString: '',
    fields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_INVITED', 'DELEGATION_STATUS_ACCEPTED'],
      delegationType: ['DELEGATION_TYPE_VAR'],
      isValid: [true]
    }
  }
  const invitationTableQuery = useTableQuery({
    useQuery: useInviteCustomerListQuery,
    defaultPayload: invitationPayload
  })
  const delegationCount = invitationTableQuery.data?.totalCount ?? 0
  const nonVarDelegation = delegationCount > 0

  const showHomeButton = nonVarDelegation || isDelegationMode() || tenantType === AccountType.MSP
      || tenantType === AccountType.VAR || tenantType === AccountType.MSP_NON_VAR
      || tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER

  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isReportsAdmin = hasRoles([RolesEnum.REPORTS_ADMIN])
  const indexPath = isGuestManager ? '/users/guestsManager' : '/dashboard'
  const isSupportDelegation = userProfile?.support && isSupportToMspDashboardAllowed
  const isHospitality = getJwtTokenPayload().acx_account_vertical === AccountVertical.HOSPITALITY
  const showMspHomeButton = isSupportDelegation && (tenantType === AccountType.MSP ||
    tenantType === AccountType.MSP_NON_VAR || tenantType === AccountType.VAR)
  const adminRoles = [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
  const isSystemAdmin = userProfile?.roles?.some(role => adminRoles.includes(role as RolesEnum))

  const hasOnboardingAssistantAccess = (isOnboardingAssistantEnabled || isCanvasEnabled) &&
  isSystemAdmin && hasCrossVenuesPermission()
  const userProfileBasePath = useTenantLink('/userprofile')
  const basePath = useTenantLink('/users/guestsManager')
  const dpskBasePath = useTenantLink('/users/dpskAdmin')
  const reportsAdminBasePath = useTenantLink('/dataStudio')
  useEffect(() => {
    if (isGuestManager && params['*'] !== 'guestsManager') {
      location.pathname.includes('/userprofile/')
        ? navigate({
          ...userProfileBasePath,
          pathname: `${userProfileBasePath.pathname}/${params['*']}`
        })
        : navigate({
          ...basePath,
          pathname: `${basePath.pathname}`
        })
    }
  }, [isGuestManager, params['*']])

  useEffect(() => {
    const currentPath = params['*'] as string
    const isAllowed = dpskAdminRoutePathKeeper(currentPath)

    if (!isDPSKAdmin || isAllowed) return

    currentPath === 'userprofile'
      ? navigate({
        ...userProfileBasePath,
        pathname: `${userProfileBasePath.pathname}`
      })
      : navigate({
        ...dpskBasePath,
        pathname: `${dpskBasePath.pathname}`
      })
  }, [isDPSKAdmin, params['*']])

  useEffect(() => {
    if(isReportsAdmin){
      const currentPath = location.pathname

      if(!currentPath.includes('/dataStudio') &&
         !currentPath.includes('/reports') &&
         params['*'] !== 'userprofile') {
        navigate({
          ...reportsAdminBasePath,
          pathname: `${reportsAdminBasePath.pathname}`
        })
      }
    }
  }, [isReportsAdmin, location.pathname, params['*']])

  const searchFromUrl = params.searchVal || ''
  const [searchExpanded, setSearchExpanded] = useState<boolean>(searchFromUrl !== '')
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isSpecialRole = hasRoles([
    RolesEnum.DPSK_ADMIN, RolesEnum.GUEST_MANAGER, RolesEnum.REPORTS_ADMIN])

  const [supportStatus, setSupportStatus] = useState('')

  return (
    <LayoutComponent
      logo={isDPSKAdmin ? logo : <TenantNavLink to={indexPath} children={logo} />}
      menuConfig={useMenuConfig()}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={<>
        { showHomeButton && (
          <a href={`/${getJwtTokenPayload().tenantId}/v/`}>
            <UI.Home>
              <LayoutUI.Icon children={<HomeSolid />} />
              {isSupportDelegation
                ? $t({ defaultMessage: 'Support Home' }) : $t({ defaultMessage: 'Home' })}
            </UI.Home>
          </a>)
        }
        <RegionButton/>
        { isHospitality && (
          <UI.VerticalTitle>
            <Typography.Title level={3}>
              {$t({ defaultMessage: 'Hospitality Edition' })}
            </Typography.Title>
          </UI.VerticalTitle>)}
        <HeaderContext.Provider value={{
          searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
          <LicenseBanner/>
        </HeaderContext.Provider>
      </>}

      rightHeaderContent={<>
        <HeaderContext.Provider value={{
          searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
          {!isSpecialRole && <GlobalSearchBar />}
          {showMspHomeButton &&
            <MspTenantLink to='/dashboard'>
              <UI.Home>
                <LayoutUI.Icon children={<HomeSolid />} />
              </UI.Home>
            </MspTenantLink>}
        </HeaderContext.Provider>
        {(!isSpecialRole || showMspHomeButton) && <LayoutUI.Divider />}
        {isDelegationMode()
          ? <MspEcDropdownList/>
          : <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>}
        {hasOnboardingAssistantAccess && <RuckusAiButton />}
        {!(isGuestManager || isDPSKAdmin || isReportsAdmin) &&
          <>
            <AlarmsButton/>
            <ActivityButton/>
          </>}
        <FetchBot showFloatingButton={false} statusCallback={setSupportStatus}/>
        <HelpButton
          isMspEc={isMspEc}
          mspBrandData={mspBrandData}
          supportStatus={supportStatus}/>
        <UserButton/>
      </>}
    />
  )
}

export default Layout
