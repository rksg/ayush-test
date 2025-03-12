import { useState } from 'react'

import { HelpButton, UserButton, MelissaBot } from '@acx-ui/analytics/components'
import { getUserProfile }                     from '@acx-ui/analytics/utils'
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
import { hasRaiPermission }                 from '@acx-ui/user'

import Logo from '../../assets/Logo.png'

import { AccountsDrawer } from './AccountsDrawer'
import { useMenuConfig }  from './menuConfig'

function Layout () {
  const params = useParams()
  const userProfile = getUserProfile()
  const searchFromUrl = params.searchVal || ''
  const [searchExpanded, setSearchExpanded] = useState<boolean>(searchFromUrl !== '')
  const [licenseExpanded, setLicenseExpanded] = useState<boolean>(false)
  const canSearch = hasRaiPermission('READ_REPORTS') || hasRaiPermission('READ_HEALTH')
  return (
    <LayoutComponent
      logo={<TenantNavLink to={''}
        children={<img src={Logo} width='180' height='60' alt='Logo' />} />}
      menuConfig={useMenuConfig()}
      content={<Outlet />}
      rightHeaderContent={<>
        <HeaderContext.Provider value={{
          searchExpanded, licenseExpanded, setSearchExpanded, setLicenseExpanded }}>
          {canSearch && <GlobalSearchBar />}
        </HeaderContext.Provider>
        <LayoutUI.Divider />
        { userProfile.tenants.length > 1 || userProfile.invitations.length > 0
          ? <AccountsDrawer user={userProfile} />
          : <LayoutUI.CompanyName>{userProfile?.selectedTenant.name}</LayoutUI.CompanyName>
        }
        <HelpButton/>
        <UserButton/>
        <MelissaBot/>
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
