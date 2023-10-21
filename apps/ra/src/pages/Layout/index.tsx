import { useState } from 'react'

import { HelpButton, UserButton }                    from '@acx-ui/analytics/components'
import { getUserProfile, PERMISSION_VIEW_ANALYTICS } from '@acx-ui/analytics/utils'
import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  GlobalSearchBar,
  HeaderContext
} from '@acx-ui/main/components'
import { Outlet, useParams, TenantNavLink } from '@acx-ui/react-router-dom'

import { ReactComponent as Logo } from '../../assets/Logo.svg'

import { AccountsDrawer } from './AccountsDrawer'
import { useMenuConfig }  from './menuConfig'

function Layout () {
  const params = useParams()
  const userProfile = getUserProfile()
  const hasAnalytics = userProfile.selectedTenant.permissions[PERMISSION_VIEW_ANALYTICS]
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
          {hasAnalytics && <GlobalSearchBar />}
        </HeaderContext.Provider>
        <LayoutUI.Divider />
        { userProfile.tenants.length > 1
          ? <AccountsDrawer user={userProfile} />
          : <LayoutUI.CompanyName>{userProfile?.selectedTenant.name}</LayoutUI.CompanyName>
        }
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
