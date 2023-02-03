import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'
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
  MspEcDropdownList,
  RegionDropdown
} from '@acx-ui/msp/components'
import { CloudMessageBanner }                from '@acx-ui/rc/components'
import { isDelegationMode, TenantIdFromJwt } from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet }         from '@acx-ui/react-router-dom'
import { notAvailableMsg }                   from '@acx-ui/utils'


import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'

function Layout () {
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
        <>
          <RegionDropdown/>
          {isDelegationMode() && <Link to={`${getBasePath()}/v/${TenantIdFromJwt()}`}>
            <LayoutUI.Icon children={<HomeSolid />} />
          </Link>}
        </>
      }

      rightHeaderContent={<>
        {isDelegationMode() && <MspEcDropdownList/>}
        <SearchBar />
        <LayoutUI.Divider />
        <AlarmsButton/>
        <ActivityButton/>
        <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
          <HelpButton/>
        </Tooltip>
        <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
          <UserButton/>
        </Tooltip>
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
