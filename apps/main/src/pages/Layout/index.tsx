import { useState } from 'react'

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
  HelpButton,
  UserButton,
  LicenseBanner,
  HeaderContext
} from '@acx-ui/main/components'
import {
  MspEcDropdownList
} from '@acx-ui/msp/components'
import { CloudMessageBanner, useUserProfileContext } from '@acx-ui/rc/components'
import { isDelegationMode, TenantIdFromJwt }         from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet }                 from '@acx-ui/react-router-dom'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'
import * as UI           from './styledComponents'

function Layout () {
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const showHomeButton = isDelegationMode() || userProfile?.var
  const { $t } = useIntl()

  const [searchExpanded, setSearchExpanded] = useState<boolean>(false)
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)

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
        <HelpButton/>
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
