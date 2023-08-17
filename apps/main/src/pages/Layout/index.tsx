import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import { HomeSolid }     from '@acx-ui/icons'
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
import {
  MspEcDropdownList
} from '@acx-ui/msp/components'
import { CloudMessageBanner }                                               from '@acx-ui/rc/components'
import { isDelegationMode }                                                 from '@acx-ui/rc/utils'
import { Outlet, useNavigate, useTenantLink, TenantNavLink, MspTenantLink } from '@acx-ui/react-router-dom'
import { useParams }                                                        from '@acx-ui/react-router-dom'
import { RolesEnum }                                                        from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                  from '@acx-ui/user'
import { AccountType, getJwtTokenPayload, PverName, useTenantId }           from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'
import * as UI           from './styledComponents'
import { useLogo }       from './useLogo'

function Layout () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const tenantId = useTenantId()
  const params = useParams()

  const logo = useLogo(tenantId)

  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const tenantType = getJwtTokenPayload().tenantType
  const showHomeButton =
    isDelegationMode() || userProfile?.var || tenantType === AccountType.MSP_NON_VAR ||
    tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER
  const isBackToRC = (PverName.ACX === getJwtTokenPayload().pver ||
    PverName.ACX_HYBRID === getJwtTokenPayload().pver)

  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const isSupport = userProfile?.support && isDelegationMode()
  const isMspVar = userProfile?.var || tenantType === AccountType.MSP_NON_VAR
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
        { showHomeButton && (isBackToRC ?
          <a href={`/api/ui/v/${getJwtTokenPayload().tenantId}`}>
            <UI.Home>
              <LayoutUI.Icon children={<HomeSolid />} />
              {isSupport ? $t({ defaultMessage: 'Support Home' }) : $t({ defaultMessage: 'Home' })}
            </UI.Home>
          </a> :
          <a href={`/${getJwtTokenPayload().tenantId}/v/dashboard`}>
            <UI.Home>
              <LayoutUI.Icon children={<HomeSolid />} />
              {isSupport ? $t({ defaultMessage: 'Support Home' }) : $t({ defaultMessage: 'Home' })}
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
          <SearchBar />
          {isSupport && isMspVar &&
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
