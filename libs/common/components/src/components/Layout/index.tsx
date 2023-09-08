import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'

import ProLayout                             from '@ant-design/pro-layout'
import { Menu }                              from 'antd'
import { ItemType as AntItemType }           from 'antd/lib/menu/hooks/useItems'
import { get, has, snakeCase }               from 'lodash'
import { debounce }                          from 'lodash'
import {
  MenuItemType as RcMenuItemType,
  SubMenuType as RcSubMenuType,
  MenuItemGroupType as RcMenuItemGroupType
} from 'rc-menu/lib/interface'
import { useIntl } from 'react-intl'

import { get as getEnv } from '@acx-ui/config'
import {
  TenantType,
  useLocation,
  TenantNavLink,
  NewTabLink,
  MLISA_BASE_PATH
} from '@acx-ui/react-router-dom'

import modifyVars from '../../theme/modify-vars'

import { Content as ResponsiveContent } from './Responsive/content'
import * as UI                          from './styledComponents'

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
  adminItem?: boolean
  openNewTab?: boolean
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
  logo: React.ReactNode;
  menuConfig: ItemType[];
  rightHeaderContent: React.ReactNode;
  leftHeaderContent?: React.ReactNode;
  content: React.ReactNode;
}

function useActiveUri () {
  const { pathname } = useLocation()
  if (getEnv('IS_MLISA_SA')) {
    return pathname.replace(MLISA_BASE_PATH, '')
  }
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
    const isActive = activePatterns?.some(pattern => activeUri.match(pattern))
    const IconComponent = isActive ? activeIcon ?? inactiveIcon : inactiveIcon
    const content = <>
      {IconComponent && <UI.MenuIcon children={<IconComponent />} />}
      {item.label}
    </>
    const className = []
    if (Boolean(isActive)) className.push('menu-active')
    if (Boolean(item.adminItem)) className.push('menu-admin-item')
    let label = content
    if (uri) {
      label = Boolean(item.openNewTab)
        ? <NewTabLink to={uri}>{label}</NewTabLink>
        : <TenantNavLink
          to={uri}
          tenantType={tenantType}
          data-label={item.label}>
          {label}
        </TenantNavLink>
    }
    return {
      ...rest,
      className: className.join(' ') || undefined,
      key,
      label,
      ...(isSubMenuType(item) && {
        popupClassName: item.children?.some(child => get(child, 'type') === 'group')
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
      getPopupContainer={trigger => trigger.parentNode as HTMLElement}
    />
  </>
}

type LayoutContextType = {
  pageHeaderY: number
  setPageHeaderY: (y: number) => void
}
const LayoutContext = createContext({
  pageHeaderY: 0,
  setPageHeaderY: () => {}
} as LayoutContextType)
export const useLayoutContext = () => useContext(LayoutContext)

export function Layout ({
  logo,
  menuConfig,
  rightHeaderContent,
  leftHeaderContent,
  content
}: LayoutProps) {
  const { $t } = useIntl()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const [pageHeaderY, setPageHeaderY] = useState(0)
  const screenXL = parseInt(modifyVars['@screen-xl'], 10)
  const [display, setDisplay] = useState(window.innerWidth >= screenXL)
  const [subOptimalDisplay, setSubOptimalDisplay] = useState(
    () => localStorage.getItem('acx-ui-view-suboptimal-display') === 'true' ?? false)

  const onSubOptimalDisplay = useCallback((state: boolean) => {
    setSubOptimalDisplay(state)
    localStorage.setItem('acx-ui-view-suboptimal-display', state.toString())
  }, [])

  const updateScreenWidth = debounce(() => {
    if(window.innerWidth >= screenXL){
      setDisplay(true)
      setSubOptimalDisplay(false)
    }else{
      setDisplay(false)
    }
  }, 500)

  useEffect(() => {
    window.addEventListener('resize', updateScreenWidth)

    return () => {
      window.removeEventListener('resize', updateScreenWidth)
    }
  }, [window.innerWidth])

  const Content = location.pathname.includes('dataStudio') ? UI.IframeContent : UI.Content

  return <UI.Wrapper showScreen={display || subOptimalDisplay} >
    <ProLayout
      breakpoint='xl'
      disableMobile={true}
      fixedHeader={true}
      fixSiderbar={display || subOptimalDisplay}
      location={location}
      menuContentRender={() => <SiderMenu menuConfig={menuConfig}/>}
      menuHeaderRender={() => logo}
      headerContentRender={() => leftHeaderContent &&
        <UI.LeftHeaderContentWrapper children={leftHeaderContent} />}
      rightContentRender={() => (display || subOptimalDisplay) &&
        <UI.RightHeaderContentWrapper children={rightHeaderContent} />}
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
      <LayoutContext.Provider value={{ pageHeaderY, setPageHeaderY }}>
        {(display || subOptimalDisplay) ? <Content>{content}</Content> :
          <UI.ResponsiveContent>
            <ResponsiveContent setShowScreen={onSubOptimalDisplay} />
          </UI.ResponsiveContent>}
      </LayoutContext.Provider>
    </ProLayout>
  </UI.Wrapper>
}
