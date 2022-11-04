import React from 'react'

import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Layout as LayoutComponent,
  LayoutUI,
  Dropdown
} from '@acx-ui/components'
import {
  WorldSolid,
  ArrowExpand,
  AccountCircleSolid,
  NotificationSolid,
  QuestionMarkCircleSolid,
  SearchOutlined
} from '@acx-ui/icons'
import { Outlet, TenantLink } from '@acx-ui/react-router-dom'

import { useMenuConfig } from './menuConfig'

function Layout () {
  const { $t } = useIntl()
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
      content={<Outlet />}
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
        <LayoutUI.ButtonOutlined shape='circle' icon={<SearchOutlined />} />
        <LayoutUI.Divider />
        <LayoutUI.ButtonSolid icon={<NotificationSolid />} />
        <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
        <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
      </>}
    />
  )
}
export default Layout
