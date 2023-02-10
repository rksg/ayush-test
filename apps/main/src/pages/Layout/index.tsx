import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  Layout as LayoutComponent,
  LayoutUI
} from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  ActivityButton,
  AlarmsButton,
  HelpButton,
  UserButton
} from '@acx-ui/main/components'
import { CloudMessageBanner } from '@acx-ui/rc/components'
import { Outlet }             from '@acx-ui/react-router-dom'
import { notAvailableMsg }    from '@acx-ui/utils'

import LicenseBar        from './LicenseBar'
import { useMenuConfig } from './menuConfig'
import RegionButton      from './RegionButton'
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
        <div style={{ width: '40%', display: 'flex', alignItems: 'center' }}>
          <RegionButton/>
          <LicenseBar/>
        </div>
      }
      rightHeaderContent={<>
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
