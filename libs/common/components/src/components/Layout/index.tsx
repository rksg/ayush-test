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

import * as UI from './styledComponents'

type SideNavProps = {
  uri?: string
  tenantType?: TenantType
  activeIcon?: React.FC
  inactiveIcon?: React.FC
  isActivePattern?: string
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

export const IGNORE_ACTIVE_PATTERN = 'ignoreActivePattern'

function useActiveUri () {
  const { pathname } = useLocation()
  const chunks = pathname.split('/')
  for (const c in chunks) {
    if (['v', 't'].includes(chunks[c])) {
      // TODO
      // update to "+ 1" once URL updated to "/tenant-id/v|t"
      return '/' + chunks.slice(Number(c) + 2).join('/')
    }
  }
  return pathname
}

function SiderMenu (props: { menuConfig: LayoutProps['menuConfig'] }) {
  const activeUri = useActiveUri()
  // needed for Chrome to ensure only single submenu opened
  const [openKeys, setOpenKeys] = useState<string[]>([])

  const getActivePatterns = (item: ItemType): (string | undefined)[] => {
    if (isMenuItemGroupType(item) || isSubMenuType(item)) {
      return item.children?.flatMap(item => getActivePatterns(item)) || []
    }
    if (item?.isActivePattern === IGNORE_ACTIVE_PATTERN) {
      return []
    }
    return [item?.isActivePattern || item?.uri]
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
    delete rest.isActivePattern

    const activePatterns = getActivePatterns(item)
    const isActive = activePatterns.some(pattern => activeUri.match(new RegExp(`^${pattern}`)))
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
        ? <TenantNavLink to={uri} tenantType={tenantType}>{content}</TenantNavLink>
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

export function Layout ({
  menuConfig,
  rightHeaderContent,
  leftHeaderContent,
  content
}: LayoutProps) {
  const { $t } = useIntl()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const dashboard = menuConfig.find(item => get(item, 'uri') === '/dashboard')

  return <UI.Wrapper>
    <ProLayout
      breakpoint='xl'
      disableMobile={true}
      fixedHeader={true}
      fixSiderbar={true}
      location={location}
      menuContentRender={() => <SiderMenu menuConfig={menuConfig}/>}
      menuHeaderRender={() => <TenantNavLink
        to='/dashboard'
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
