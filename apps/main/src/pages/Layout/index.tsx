import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  Layout as LayoutComponent,
  LayoutUI
}                        from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import { HomeSolid }     from '@acx-ui/icons'
import {
  MspEcDropdownList,
  RegionDropdown
} from '@acx-ui/msp/components'
import { isDelegationMode }          from '@acx-ui/rc/utils'
import { TenantIdFromJwt }           from '@acx-ui/rc/utils'
import { getBasePath, Link, Outlet } from '@acx-ui/react-router-dom'
import { notAvailableMsg }           from '@acx-ui/utils'

import ActivityButton from './Header/ActivityButton'
import AlarmButton    from './Header/AlarmButton'
import HelpButton     from './Header/HelpButton'
// import LicenseBar        from './Header/LicenseBar'
// import RegionButton      from './Header/RegionButton'
import UserButton        from './Header/UserButton'
import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'

function Layout () {

  return (
    <LayoutComponent
      menuConfig={useMenuConfig()}
      content={<Outlet />}
      // leftHeaderContent={
      //   <div style={{ width: '40%', display: 'flex', alignItems: 'center' }}>
      //     {/* <RegionButton/>
      //     <LicenseBar/> */}
      //   </div>
      // }
      leftHeaderContent={
        <>
          <RegionDropdown/>
          {isDelegationMode() && <Link to={`${getBasePath()}/v/${TenantIdFromJwt()}`}>
            <LayoutUI.Icon children={<HomeSolid />} />
          </Link>}
        </>

        // <div style={{ width: '40%', display: 'flex', alignItems: 'center' }}>
        //   <RegionButton/>
        //   <LicenseBar/>
        // </div>
      }
      rightHeaderContent={<>
        {isDelegationMode() && <MspEcDropdownList/>}
        <SearchBar />
        <LayoutUI.Divider />
        <AlarmButton/>
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
