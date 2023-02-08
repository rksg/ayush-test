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
  MspEcDropdownList
} from '@acx-ui/msp/components'
import { CloudMessageBanner, useUserProfileContext } from '@acx-ui/rc/components'
import { isDelegationMode, TenantIdFromJwt }         from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet }                 from '@acx-ui/react-router-dom'
import { notAvailableMsg }                           from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'
import * as UI           from './styledComponents'

function Layout () {
  const { data: userProfile } = useUserProfileContext()
  const companyName = userProfile?.companyName

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
        isDelegationMode() && <Link to={`${getBasePath()}/v/${TenantIdFromJwt()}`}>
          <LayoutUI.Icon children={<HomeSolid />} />
        </Link>
      }

      rightHeaderContent={<>
        <SearchBar />
        <LayoutUI.Divider />
        {isDelegationMode() ? <MspEcDropdownList/> : <UI.CompanyName>{companyName}</UI.CompanyName>}
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
