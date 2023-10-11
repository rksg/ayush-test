import { useState } from 'react'

import { Menu } from 'antd'

import { HelpButton, UserButton }                    from '@acx-ui/analytics/components'
import { getUserProfile, PERMISSION_VIEW_ANALYTICS } from '@acx-ui/analytics/utils'
import {
  Layout as LayoutComponent,
  LayoutUI,
  Dropdown
} from '@acx-ui/components'
import { SplitProvider }  from '@acx-ui/feature-toggle'
import { CaretDownSolid } from '@acx-ui/icons'
import {
  GlobalSearchBar,
  HeaderContext
} from '@acx-ui/main/components'
import { Outlet, useParams, TenantNavLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { ReactComponent as Logo } from '../../assets/Logo.svg'

import { useMenuConfig } from './menuConfig'


type Account = {
  id: string
  name: string
}
function AccountsDropdown ({
  accounts,
  selectedAccountName
} : { accounts: Account[], selectedAccountName: string }) {
  const navigate = useNavigate()
  const basePath = useTenantLink('')
  const accountsMenu = <Menu
    onClick={({ key }) => {
      const matchedAccount = accounts.find(account => account.id === key) as Account
      navigate({
        ...basePath,
        pathname: `${basePath.pathname}`,
        search: `?selectedTenants=${window.btoa(JSON.stringify([matchedAccount.id]))}`
      })
    }}
    items={accounts.map(account => ({ key: account.id, label: account.name }))}
  />
  return <Dropdown overlay={accountsMenu}>{() =><LayoutUI.DropdownText>
    <LayoutUI.CompanyName>{selectedAccountName}</LayoutUI.CompanyName>
    <LayoutUI.DropdownCaretIcon children={<CaretDownSolid />}/>
  </LayoutUI.DropdownText>}</Dropdown>
}
function Layout () {
  const params = useParams()
  const userProfile = getUserProfile()
  const accounts = userProfile.tenants
  const selectedAccountName = userProfile?.selectedTenant.name
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
        { accounts.length > 1
          ? <AccountsDropdown accounts={accounts} selectedAccountName={selectedAccountName} />
          : <LayoutUI.CompanyName>{selectedAccountName}</LayoutUI.CompanyName>
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
