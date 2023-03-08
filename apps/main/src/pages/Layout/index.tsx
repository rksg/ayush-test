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
import { CloudMessageBanner }                                    from '@acx-ui/rc/components'
import { isDelegationMode, TenantIdFromJwt }                     from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { useParams }                                             from '@acx-ui/react-router-dom'
import { RolesEnum }                                             from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                       from '@acx-ui/user'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'
import * as UI           from './styledComponents'



function Layout () {
  const [supportStatus,setSupportStatus] = useState('')
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const showHomeButton = isDelegationMode() || userProfile?.var
  const { $t } = useIntl()
  const basePath = useTenantLink('/users/guestsManager')
  const navigate = useNavigate()
  const params = useParams()
  const searchFromUrl = params.searchVal || ''

  const [searchExpanded, setSearchExpanded] = useState<boolean>(searchFromUrl !== '')
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])

  useEffect(() => {
    if (isGuestManager) {
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}`
      })
    }
  }, [isGuestManager])

  return (
    <LayoutComponent
      menuConfig={useMenuConfig()}
      content={
        <>
          <CloudMessageBanner />
          <Outlet />
        </>
      }
      leftHeaderContent={
        <UI.LeftHeaderWrapper>
          { showHomeButton && <Link to={`${getBasePath()}/v/${TenantIdFromJwt()}`}>
            <UI.Home>
              <LayoutUI.Icon children={<HomeSolid />} />
              {$t({ defaultMessage: 'Home' })}
            </UI.Home>
          </Link> }
          <RegionButton/>
          <HeaderContext.Provider value={{
            searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
            <LicenseBanner/>
          </HeaderContext.Provider>
        </UI.LeftHeaderWrapper>
      }

      rightHeaderContent={<>
        <HeaderContext.Provider value={{
          searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
          <SearchBar />
        </HeaderContext.Provider>
        <LayoutUI.Divider />
        {isDelegationMode()
          ? <MspEcDropdownList/>
          : <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>}
        <AlarmsButton/>
        <ActivityButton/>
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
