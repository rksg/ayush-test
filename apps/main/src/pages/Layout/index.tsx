import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI
}                        from '@acx-ui/components'
import { SplitProvider } from '@acx-ui/feature-toggle'
import {
  AccountCircleSolid,
  NotificationSolid,
  QuestionMarkCircleSolid,
  SearchOutlined
}                                              from '@acx-ui/icons'
import { Outlet }                              from '@acx-ui/react-router-dom'
import { DateFilterProvider, notAvailableMsg } from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'

function Layout () {
  return (
    <SplitProvider>
      <DateFilterProvider>
        <LayoutComponent
          menuConfig={useMenuConfig()}
          content={<Outlet />}
          rightHeaderContent={<>
            <Tooltip title={useIntl().$t(notAvailableMsg)}>
              <LayoutUI.ButtonOutlined disabled shape='circle' icon={<SearchOutlined />} />
            </Tooltip>
            <LayoutUI.Divider />
            <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
              {/* TODO: add back <AlarmsHeaderButton/> when remove disable */}
              <LayoutUI.ButtonSolid disabled icon={<NotificationSolid />} />
            </Tooltip>
            <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
              <LayoutUI.ButtonSolid disabled icon={<QuestionMarkCircleSolid />} />
            </Tooltip>
            <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
              <LayoutUI.ButtonSolid disabled icon={<AccountCircleSolid />} />
            </Tooltip>
          </>}
        />
      </DateFilterProvider>
    </SplitProvider>
  )
}
export default Layout
