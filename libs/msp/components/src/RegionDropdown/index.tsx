// import React from 'react'

import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import {
  LayoutUI,
  Dropdown
} from '@acx-ui/components'
import {
  WorldSolid,
  ArrowExpand
} from '@acx-ui/icons'
import { TenantLink } from '@acx-ui/react-router-dom'

export function RegionDropdown () {
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
    <Dropdown overlay={regionMenu}>{(selectedKeys) =>
      <LayoutUI.DropdownText>
        <LayoutUI.Icon children={<WorldSolid />} />
        {selectedKeys}
        <LayoutUI.Icon children={<ArrowExpand />} />
      </LayoutUI.DropdownText>
    }</Dropdown>
  )
}
