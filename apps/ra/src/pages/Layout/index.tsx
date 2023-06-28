import { useState } from 'react'

import { UserButton } from '@acx-ui/analytics/components'
import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  // HelpButton,
  HeaderContext,
  Logo
} from '@acx-ui/main/components'
import { Outlet, useParams, TenantNavLink } from '@acx-ui/react-router-dom'

import { useMenuConfig } from './menuConfig'
// import SearchBar         from './SearchBar'

function Layout () {
  const params = useParams()
  const companyName = 'companyName'
  const searchFromUrl = params.searchVal || ''
  const [searchExpanded, setSearchExpanded] = useState<boolean>(searchFromUrl !== '')
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  return (
    <LayoutComponent
      logo={<TenantNavLink to={''} children={<Logo />} />}
      menuConfig={useMenuConfig()}
      content={<Outlet />}
      rightHeaderContent={<>
        <HeaderContext.Provider value={{
          searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
          {/*<SearchBar />*/}
        </HeaderContext.Provider>
        <LayoutUI.Divider />
        <LayoutUI.CompanyName>{companyName}</LayoutUI.CompanyName>
        {/*<HelpButton/>*/}
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
