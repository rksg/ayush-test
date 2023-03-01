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
  UserButton
} from '@acx-ui/main/components'
import {
  MspEcDropdownList
} from '@acx-ui/msp/components'
import { CloudMessageBanner, useUserProfileContext } from '@acx-ui/rc/components'
import { isDelegationMode, TenantIdFromJwt }         from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet }                 from '@acx-ui/react-router-dom'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'
import { Home }          from './styledComponents'


function Layout () {
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName
  const showHomeButton = isDelegationMode() || userProfile?.var

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
        showHomeButton && <Link to={`${getBasePath()}/v/${TenantIdFromJwt()}`}>
          <Home>
            <LayoutUI.Icon children={<HomeSolid />} />
            Home
          </Home>
        </Link>
      }

      rightHeaderContent={<>
        <SearchBar />
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
