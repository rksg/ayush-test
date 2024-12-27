import React, { useState } from 'react'

import {
  DropdownProps as AntDropdownProps,
  MenuProps as AntMenuProps
} from 'antd'
import { MenuItemType } from 'rc-menu/lib/interface'

import { RbacOpsIds, ScopeKeys } from '@acx-ui/types'

import * as UI from './styledComponents'

export interface DropdownProps extends Omit<AntDropdownProps, 'overlay' | 'trigger' | 'children'> {
  overlay: React.ReactElement<AntMenuProps>
  scopeKey?: ScopeKeys,
  rbacOpsIds?: RbacOpsIds,
  children: (selectedKeys: string | null) => React.ReactElement
}

export interface DropdownItemType extends MenuItemType {
  scopeKey?: ScopeKeys,
  rbacOpsIds?: RbacOpsIds,
  allowedOperationUrl?: string
}

export function Dropdown ({ overlay, children, scopeKey, ...props }: DropdownProps) {
  const { defaultSelectedKeys, onClick } = overlay.props
  const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>(defaultSelectedKeys)
  const transformedOverlay = {
    ...overlay,
    props: {
      ...overlay.props,
      items: (overlay?.props?.items as DropdownItemType[])?.map(item => {
        const itemProps = item ?? {}
        const { scopeKey, allowedOperationUrl, ...props } = itemProps
        return props
      })
    }
  }
  const menu = React.cloneElement(transformedOverlay, {
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
