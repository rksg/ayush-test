import React, { useState } from 'react'

import { WifiScopes, SwitchScopes, EdgeScopes } from '@acx-ui/user'

import * as UI from './styledComponents'

import type {
  DropdownProps as AntDropdownProps,
  MenuProps as AntMenuProps
} from 'antd'

export interface DropdownProps extends Omit<AntDropdownProps, 'overlay' | 'trigger' | 'children'> {
  overlay: React.ReactElement<AntMenuProps>
  scopeKey?: (WifiScopes|SwitchScopes|EdgeScopes)[],
  children: (selectedKeys: string | null) => React.ReactElement
}

export function Dropdown ({ overlay, children, ...props }: DropdownProps) {
  const { defaultSelectedKeys, onClick } = overlay.props
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(defaultSelectedKeys)
  const menu = React.cloneElement(overlay, {
    onClick: ((event) => {
      onClick && onClick(event)
      setSelectedKeys([event.key])
    }) as AntMenuProps['onClick']
  })
  return <UI.Dropdown
    overlay={menu}
    trigger={['click']}
    {...props}
  >{children && children!(selectedKeys ? selectedKeys.join(', ') : null)}</UI.Dropdown>
}

Dropdown.MenuItemWithIcon = UI.MenuItemWithIcon
Dropdown.OverlayContainer = UI.OverlayContainer
Dropdown.OverlayTitle = UI.OverlayTitle
