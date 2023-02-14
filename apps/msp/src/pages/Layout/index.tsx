import { useState } from 'react'

import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  Layout as LayoutComponent,
  LayoutUI,
  Dropdown
} from '@acx-ui/components'
import {
  WorldSolid,
  ArrowExpand
} from '@acx-ui/icons'
import {
  ActivityButton,
  AlarmsButton,
  FetchBot,
  HelpButton,
  UserButton
} from '@acx-ui/main/components'
import {  CloudMessageBanner } from '@acx-ui/rc/components'
import { Outlet, TenantLink }  from '@acx-ui/react-router-dom'
import { notAvailableMsg }     from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'

function Layout () {
  const { $t } = useIntl()
  const [supportStatus,setSupportStatus] = useState('')
  const regionMenu = <Menu
    selectable
    defaultSelectedKeys={['US']}
    items={[
      { key: 'US', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'US' })}</TenantLink> },
      { key: 'EU', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'EU' })}</TenantLink> },
      { key: 'Asia', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'ASIA' })}</TenantLink> }
    ]}
  />
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
        <Dropdown overlay={regionMenu}>{(selectedKeys) =>
          <LayoutUI.DropdownText>
            <LayoutUI.Icon children={<WorldSolid />} />
            {selectedKeys}
            <LayoutUI.Icon children={<ArrowExpand />} />
          </LayoutUI.DropdownText>
        }</Dropdown>
      }
      rightHeaderContent={<>
        <LayoutUI.Divider />
        <AlarmsButton/>
        <ActivityButton/>
        <FetchBot showFloatingButton={false} statusCallback={setSupportStatus}/>
        <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
          <HelpButton supportStatus={supportStatus}/>
        </Tooltip>
        <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
          <UserButton/>
        </Tooltip>
      </>}
    />
  )
}
export default Layout
