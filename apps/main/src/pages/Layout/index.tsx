import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { Features, SplitProvider, useIsSplitOn } from '@acx-ui/feature-toggle'
import { HomeSolid }                             from '@acx-ui/icons'
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
import { useInviteCustomerListQuery }                                       from '@acx-ui/msp/services'
import { CloudMessageBanner }                                               from '@acx-ui/rc/components'
import { useGetTenantDetailsQuery }                                         from '@acx-ui/rc/services'
import { useTableQuery }                                                    from '@acx-ui/rc/utils'
import { Outlet, useNavigate, useTenantLink, TenantNavLink, MspTenantLink } from '@acx-ui/react-router-dom'
import { useParams }                                                        from '@acx-ui/react-router-dom'
import { RolesEnum }                                                        from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                  from '@acx-ui/user'
import { AccountType, getJwtTokenPayload, isDelegationMode, useTenantId }   from '@acx-ui/utils'

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
    defaultPayload: invitationPayload,
    option: {
      skip: tenantType === AccountType.REC
    }
  })
  const delegationCount = invitationTableQuery.data?.totalCount ?? 0
  const nonVarDelegation =
    useIsSplitOn(Features.ANY_3RDPARTY_INVITE_TOGGLE) && delegationCount > 0

  const showHomeButton = nonVarDelegation ||
    isDelegationMode() || userProfile?.var || tenantType === AccountType.MSP_NON_VAR ||
    tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER

  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isSupportDelegation = userProfile?.support && isSupportToMspDashboardAllowed
  const showMspHomeButton = isSupportDelegation && (tenantType === AccountType.MSP ||
    tenantType === AccountType.MSP_NON_VAR || tenantType === AccountType.VAR)
  const indexPath = isGuestManager ? '/users/guestsManager' : '/dashboard'
  const basePath = useTenantLink('/users/guestsManager')
  const dpskBasePath = useTenantLink('/users/dpskAdmin')
  useEffect(() => {
    if (isGuestManager && params['*'] !== 'guestsManager') {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}`
      })
    }
    if (isDPSKAdmin && !(params['*'] as string).includes('dpsk')) {
      navigate({
        ...dpskBasePath,
        pathname: `${dpskBasePath.pathname}`
      })
    }
  }, [isGuestManager, isDPSKAdmin, params['*']])

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
