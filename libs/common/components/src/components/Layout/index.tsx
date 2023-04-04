import React, { useState } from 'react'

import ProLayout                         from '@ant-design/pro-layout'
import { Menu }                          from 'antd'
import { ItemType as AntItemType }       from 'antd/lib/menu/hooks/useItems'
import { get, has, snakeCase }           from 'lodash'
import {
  MenuItemType as RcMenuItemType,
  SubMenuType as RcSubMenuType,
  MenuItemGroupType as RcMenuItemGroupType,
  MenuDividerType as RcMenuDividerType
} from 'rc-menu/lib/interface'
import { useIntl } from 'react-intl'

import { Logo }                                   from '@acx-ui/icons'
import { TenantType, useLocation, TenantNavLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

type SideNavProps = {
  uri?: string
  tenantType?: TenantType
  activeIcon?: React.FC
  inactiveIcon?: React.FC
  isActivePattern?: string[]
}

type MenuItemType = Omit<RcMenuItemType, 'key' | 'label'> & SideNavProps & {
  label: string
  danger?: boolean
  icon?: React.ReactNode
  title?: string
}
type SubMenuType = Omit<RcSubMenuType, 'children' | 'key' | 'label'> & SideNavProps & {
  label: string
  icon?: React.ReactNode
  theme?: 'dark' | 'light'
  children: ItemType[]
}
type MenuItemGroupType = Omit<RcMenuItemGroupType, 'children' | 'label'> & {
  label: string
  children?: ItemType[]
}
type MenuDividerType = RcMenuDividerType & {
  dashed?: boolean;
}

type ItemType = MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType | null


export function isMenuItemType (value: ItemType): value is MenuItemType{
  if(isSubMenuType(value)) return false
  if(isMenuItemGroupType(value)) return false
  if(isMenuDividerType(value)) return false
  return true
}

export function isSubMenuType (value: ItemType): value is SubMenuType{
  if (has(value, 'children') && !has(value, 'type')) return true
  return false
}

export function isMenuItemGroupType (value: ItemType): value is MenuItemGroupType{
  if (has(value, 'type') && get(value, 'type') === 'group') return true
  return false
}

export function isMenuDividerType (value: ItemType): value is MenuDividerType{
  if (has(value, 'type') && get(value, 'type') === 'divider') return true
  return false
}

export interface LayoutProps {
  menuConfig: ItemType[];
  rightHeaderContent: React.ReactNode;
  leftHeaderContent?: React.ReactNode;
  content: React.ReactNode;
}

function SiderMenu (props: { menuConfig: LayoutProps['menuConfig'] }) {
  const location = useLocation()
  const breakpoint = /\/t\/\w+/
  const activeUri = location.pathname.split(breakpoint)?.[1]
  // needed for Chrome to ensure only single submenu opened
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const getMenuItem = (item: LayoutProps['menuConfig'][number], key: string): AntItemType => {
    if (item === null) return item
    if(isMenuDividerType(item)) { return item }

    key = `${key}-${snakeCase(item.label)}`

    if(isMenuItemGroupType(item)) { return {
      ...item,
      key: key,
      label: get(item, 'label', ''),
      children: item.children?.map(child => getMenuItem(child, key))
    } }

    const { uri, tenantType, activeIcon, inactiveIcon, isActivePattern, ...rest } = item!
    const isActive = isActivePattern?.some(pattern => activeUri?.includes(pattern))
    const IconComponent = (isActive ? activeIcon : inactiveIcon || activeIcon )as React.FC
    const content = <>
      {IconComponent &&
      (isActive
        ? <UI.MenuIconSolid children={<IconComponent />} />
        : <UI.MenuIconOutlined children={<IconComponent />} />)
      }
      {get(item, 'label', '')}
    </>
    return {
      ...rest,
      className: Boolean(isActive) ? 'menu-active' : 'menu-inactive',
      key: key,
      label: uri
        ? <TenantNavLink to={uri} tenantType={tenantType}>{content}</TenantNavLink>
        : content,
      ...(isSubMenuType(item) && {
        popupClassName: item.children.some(child => get(child, 'type') === 'group')
          ? 'layout-group-horizontal' : '',
        children: item.children.map(child => getMenuItem(child, key))
      })
    }
  }

  return <Menu
    selectedKeys={[]}
    openKeys={openKeys}
    items={props.menuConfig.map(item => getMenuItem(item, ''))}
    onOpenChange={keys => setOpenKeys(keys.slice(-1))}
  />
}

export function Layout ({
  menuConfig,
  rightHeaderContent,
  leftHeaderContent,
  content
}: LayoutProps) {
  const { $t } = useIntl()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const dashboard = menuConfig
    .find(item => ('uri' in item!) && item.uri=== '/dashboard')

  return <UI.Wrapper>
    <ProLayout
      breakpoint='xl'
      disableMobile={true}
      fixedHeader={true}
      fixSiderbar={true}
      location={location}
      menuContentRender={() => <SiderMenu menuConfig={menuConfig}/>}
      menuHeaderRender={() =>
        <TenantNavLink
          to='/dashboard'
          tenantType={
            ((isMenuItemType(dashboard!) || isSubMenuType(dashboard!)) && dashboard.tenantType)
            || 't'}
        >
          <Logo />
        </TenantNavLink>
      }
      headerContentRender={() => leftHeaderContent && <UI.LeftHeaderContentWrapper>
        <UI.LogoDivider />
        {leftHeaderContent}
      </UI.LeftHeaderContentWrapper>}
      rightContentRender={() => <UI.RightHeaderContentWrapper>
        {rightHeaderContent}
      </UI.RightHeaderContentWrapper>}
      onCollapse={setCollapsed}
      collapsedButtonRender={(collapsed: boolean) => <>
        {collapsed ? <UI.ArrowCollapsed /> : <UI.Arrow />}
        <UI.CollapseText
          className='ant-pro-menu-item-title'
          children={$t({ defaultMessage: 'Collapse' })}
        />
      </>}
      className={collapsed ? 'sider-collapsed' : ''}
    >
      <UI.Content>{content}</UI.Content>
    </ProLayout>
  </UI.Wrapper>
}
