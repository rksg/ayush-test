import React, { useState } from 'react'

import ProLayout                             from '@ant-design/pro-layout'
import { Menu }                              from 'antd'
import { ItemType as AntItemType }           from 'antd/lib/menu/hooks/useItems'
import { get, has, snakeCase }               from 'lodash'
import {
  MenuItemType as RcMenuItemType,
  SubMenuType as RcSubMenuType,
  MenuItemGroupType as RcMenuItemGroupType
} from 'rc-menu/lib/interface'
import { useIntl } from 'react-intl'

import { Logo }                                   from '@acx-ui/icons'
import { TenantType, useLocation, TenantNavLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                              from '@acx-ui/types'
import { hasRoles }                               from '@acx-ui/user'

import * as UI from './styledComponents'

export enum IsActiveCheck {
  STARTS_WITH_URI = 'STARTS_WITH_URI',
  IGNORE_ACTIVE_CHECK = 'IGNORE_ACTIVE_CHECK'
}

type SideNavProps = {
  uri?: string
  tenantType?: TenantType
  activeIcon?: React.FC
  inactiveIcon?: React.FC
  isActiveCheck?: IsActiveCheck | RegExp
}

type MenuItemType = Omit<RcMenuItemType, 'key' | 'label'> & SideNavProps & {
  label: string
}
type SubMenuType = Omit<RcSubMenuType, 'children' | 'key' | 'label'> & SideNavProps & {
  label: string
  children: ItemType[]
}
type MenuItemGroupType = Omit<RcMenuItemGroupType, 'children' | 'label'> & {
  label: string
  children?: ItemType[]
}

type ItemType = MenuItemType | SubMenuType | MenuItemGroupType | null

export function isSubMenuType (value: ItemType): value is SubMenuType {
  if (has(value, 'children') && !has(value, 'type')) return true
  return false
}

export function isMenuItemGroupType (value: ItemType): value is MenuItemGroupType {
  if (has(value, 'type') && get(value, 'type') === 'group') return true
  return false
}

export interface LayoutProps {
  menuConfig: ItemType[];
  rightHeaderContent: React.ReactNode;
  leftHeaderContent?: React.ReactNode;
  content: React.ReactNode;
}

function useActiveUri () {
  const { pathname } = useLocation()
  const chunks = pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) {
      return '/' + chunks.slice(Number(c) + 1).join('/')
    }
  }
  return pathname
}

function SiderMenu (props: { menuConfig: LayoutProps['menuConfig'] }) {
  const activeUri = useActiveUri()
  // needed for Chrome to ensure only single submenu opened
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const getActivePatterns = (item: ItemType): RegExp[] => {
    if (isMenuItemGroupType(item) || isSubMenuType(item)) {
      return item.children!.flatMap(item => getActivePatterns(item))
    }
    const isActiveCheck = item?.isActiveCheck || IsActiveCheck.STARTS_WITH_URI
    switch (isActiveCheck) {
      case IsActiveCheck.STARTS_WITH_URI:
        return [new RegExp(`^${item?.uri}`)]
      case IsActiveCheck.IGNORE_ACTIVE_CHECK:
        return []
      default:
        return [isActiveCheck]
    }
  }

  const getMenuItem = (item: LayoutProps['menuConfig'][number], key: string): AntItemType => {
    if (item === null) return item

    key = `${key}-${snakeCase(item.label)}`

    if (isMenuItemGroupType(item)) {
      return {
        ...item,
        key: key,
        label: item.label,
        children: item.children?.map(child => getMenuItem(child, key))
      }
    }

    const { uri, tenantType, activeIcon, inactiveIcon, ...rest } = item
    delete rest.isActiveCheck

    const activePatterns = getActivePatterns(item)
    const isActive = activePatterns.some(pattern => activeUri.match(pattern))
    const IconComponent = isActive ? activeIcon ?? inactiveIcon : inactiveIcon
    const content = <>
      {IconComponent && <UI.MenuIcon children={<IconComponent />} />}
      {item.label}
    </>
    return {
      ...rest,
      className: Boolean(isActive) ? 'menu-active' : undefined,
      key: key,
      label: uri
        ? <TenantNavLink
          to={uri}
          tenantType={tenantType}
          data-label={item.label}>{content}</TenantNavLink>
        : content,
      ...(isSubMenuType(item) && {
        popupClassName: item.children.some(child => get(child, 'type') === 'group')
          ? 'layout-group-horizontal' : '',
        children: item.children.map(child => getMenuItem(child, key))
      })
    }
  }

  return <>
    <UI.MenuGlobalStyle />
    <Menu
      selectedKeys={[]}
      openKeys={openKeys}
      items={props.menuConfig.map(item => getMenuItem(item, ''))}
      onOpenChange={keys => setOpenKeys(keys.slice(-1))}
    />
  </>
}

function findDashboard (menuConfig: ItemType[]): ItemType | undefined {
  let dashboard: ItemType | undefined
  for (const item of menuConfig) {
    if (isMenuItemGroupType(item) || isSubMenuType(item)) {
      dashboard = findDashboard(item.children!)
      return dashboard
    }
    dashboard = (item?.uri && item.uri.startsWith('/dashboard')) ? item : undefined
    if (dashboard) break
  }
  return dashboard
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

  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const indexPath = isGuestManager ? '/users/guestsManager' : '/dashboard'
  const dashboard = findDashboard(menuConfig)

  return <UI.Wrapper>
    <ProLayout
      breakpoint='xl'
      disableMobile={true}
      fixedHeader={true}
      fixSiderbar={true}
      location={location}
      menuContentRender={() => <SiderMenu menuConfig={menuConfig}/>}
      menuHeaderRender={() => <TenantNavLink
        to={indexPath}
        tenantType={get(dashboard, 'tenantType', 't')}
        children={<Logo />}
      />}
      headerContentRender={() => leftHeaderContent && <UI.LeftHeaderContentWrapper>
        <UI.LogoDivider />
        {leftHeaderContent}
      </UI.LeftHeaderContentWrapper>}
      rightContentRender={() => <UI.RightHeaderContentWrapper children={rightHeaderContent} />}
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
