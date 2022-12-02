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
  Logout,
  NotificationSolid,
  QuestionMarkCircleSolid
} from '@acx-ui/icons'
import { Outlet, TenantLink, MspTenantLink, useLocation } from '@acx-ui/react-router-dom'

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
  const location = useLocation()
  const userMenu = <Menu
    items={[
      { key: 'user-profile',
        label: <MspTenantLink
          state={{ from: location.pathname }}
          to='/userprofile/'>{$t({ defaultMessage: 'User Profile' })}
        </MspTenantLink>
      },
      { key: 'change-password',
        disabled: true,
        label: <TenantLink to='TODO'>{$t({ defaultMessage: 'Change Password' })}</TenantLink>
      },
      { type: 'divider' },
      { key: 'logout',
        disabled: true,
        icon: <Logout/>,
        label: <TenantLink to='TODO'>{$t({ defaultMessage: 'Log out' })}</TenantLink>
      }
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
        <LayoutUI.Divider />
        <LayoutUI.ButtonSolid icon={<NotificationSolid />} />
        <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
        <Dropdown overlay={userMenu}>{() =>
          <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
        }</Dropdown>
      </>}
    />
  )
}
export default Layout
