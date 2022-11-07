
import { ReactElement, JSXElementConstructor } from 'react'
import { Menu, Avatar } from 'antd'
import { useIntl } from 'react-intl'

import {
  LayoutUI,
  Dropdown
}                        from '@acx-ui/components'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'
import { TenantLink }              from '@acx-ui/react-router-dom'



export default function RegionButton () {
  const { $t } = useIntl()
  const menus = <Menu
    selectable
    defaultSelectedKeys={['US']}
    items={[
      { key: 'US', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'US' })}</TenantLink> },
      { key: 'EU', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'EU' })}</TenantLink> },
      { key: 'Asia', label: <TenantLink to='TODO'>{$t({ defaultMessage: 'ASIA' })}</TenantLink> }
    ]}
  />
  return <Dropdown overlay={menus}>{() =>
    <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
  }</Dropdown>
}
