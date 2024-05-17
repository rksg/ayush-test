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
import { Outlet, useNavigate, useTenantLink, TenantNavLink, MspTenantLink }                from '@acx-ui/react-router-dom'
import { useParams }                                                                       from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                       from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                                 from '@acx-ui/user'
import { AccountType, AccountVertical, getJwtTokenPayload, isDelegationMode, useTenantId } from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import * as UI           from './styledComponents'
import { useLogo }       from './useLogo'

function Layout () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantId = useTenantId()
  const params = useParams()
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()

  const logo = useLogo(tenantId)

  const { data: userProfile } = useUserProfileContext()
  const { data: tenantDetails } = useGetTenantDetailsQuery({ params })
  const { data: mspEcProfile } = useGetMspEcProfileQuery({ params })
  const isMspEc = MSPUtils().isMspEc(mspEcProfile)
  const { data: mspBrandData } = useGetBrandingDataQuery({ params }, { skip: !isMspEc })

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
  const nonVarDelegation =
    useIsSplitOn(Features.ANY_3RDPARTY_INVITE_TOGGLE) && delegationCount > 0

  const showHomeButton = nonVarDelegation ||
    isDelegationMode() || userProfile?.var || tenantType === AccountType.MSP_NON_VAR ||
    tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER

  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isReportsAdmin = hasRoles([RolesEnum.REPORTS_ADMIN])
  const isSupportDelegation = userProfile?.support && isSupportToMspDashboardAllowed
  const isHospitality = useIsSplitOn(Features.VERTICAL_RE_SKINNING) &&
    getJwtTokenPayload().acx_account_vertical === AccountVertical.HOSPITALITY
  const showMspHomeButton = isSupportDelegation && (tenantType === AccountType.MSP ||
    tenantType === AccountType.MSP_NON_VAR || tenantType === AccountType.VAR)
  const indexPath = isGuestManager ? '/users/guestsManager' : '/dashboard'
  const userProfileBasePath = useTenantLink('/userprofile')
  const basePath = useTenantLink('/users/guestsManager')
  const dpskBasePath = useTenantLink('/users/dpskAdmin')
  const reportsAdminBasePath = useTenantLink('/dataStudio')
  useEffect(() => {
    if (isGuestManager && params['*'] !== 'guestsManager') {
      (params['*'] === 'userprofile')
        ? navigate({
          ...userProfileBasePath,
          pathname: `${userProfileBasePath.pathname}`
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
      navigate({
        ...reportsAdminBasePath,
        pathname: `${reportsAdminBasePath.pathname}`
      })
    }
  }, [isReportsAdmin])

  const searchFromUrl = params.searchVal || ''
  const [searchExpanded, setSearchExpanded] = useState<boolean>(searchFromUrl !== '')
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)

  const [supportStatus, setSupportStatus] = useState('')

  return (
    <LayoutComponent
      logo={<TenantNavLink to={indexPath} children={logo} />}
      menuConfig={useMenuConfig()}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={<>
        { showHomeButton && (
          <a href={`/${getJwtTokenPayload().tenantId}/v/dashboard`}>
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
          <GlobalSearchBar />
          {showMspHomeButton &&
            <MspTenantLink to='/dashboard'>
              <UI.Home>
                <LayoutUI.Icon children={<HomeSolid />} />
              </UI.Home>
            </MspTenantLink>}
        </HeaderContext.Provider>
        <LayoutUI.Divider />
        {isDelegationMode()
          ? <MspEcDropdownList/>
          : <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>}
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
