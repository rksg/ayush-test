import { Input }   from 'antd'
import { useIntl } from 'react-intl'


import { Tooltip, GridRow, GridCol, cssStr } from '@acx-ui/components'
import {
  Layout as LayoutComponent,
  LayoutUI
}                        from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  SearchOutlined
}                          from '@acx-ui/icons'
import { Outlet }          from '@acx-ui/react-router-dom'
import { notAvailableMsg } from '@acx-ui/utils'

import ActivityButton    from './Header/ActivityButton'
import AlarmButton       from './Header/AlarmButton'
import HelpButton        from './Header/HelpButton'
import LicenseBar        from './Header/LicenseBar'
import RegionButton      from './Header/RegionButton'
import UserButton        from './Header/UserButton'
import { useMenuConfig } from './menuConfig'

function Layout () {

  return (
    <SplitProvider>
      <LayoutComponent
        menuConfig={useMenuConfig()}
        content={<Outlet />}
        leftHeaderContent={
          <div style={{ width: '40%', display: 'flex', alignItems: 'center' }}>
            <RegionButton/>
            <LicenseBar/>
          </div>
        }
        rightHeaderContent={<>
          <Tooltip title={useIntl().$t(notAvailableMsg)}>
            <GridRow>
              <GridCol col={{ span: 19 }}>
                <Input disabled
                  placeholder={useIntl().$t(({ defaultMessage: 'What are you looking for?' }))}
                  style={{
                    color: cssStr('--acx-primary-white')
                  }}
                  bordered={false}/>
              </GridCol>
              <GridCol col={{ span: 5 }}>
                <LayoutUI.ButtonOutlined disabled
                  shape='circle'
                  style={{ background: cssStr('--acx-neutrals-70') }}
                  icon={
                    <SearchOutlined/>
                  } />
              </GridCol>
            </GridRow>
          </Tooltip>
          <LayoutUI.Divider />
          {/* <AlarmsHeaderButton /> */}
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
    </SplitProvider>
  )
}
export default Layout
