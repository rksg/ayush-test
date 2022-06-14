
import React, { useState } from 'react'

import ProLayout   from '@ant-design/pro-layout'
import { isEmpty } from 'lodash'

import {
  NavLink,
  useLocation,
  useTenantLink
} from '@acx-ui/react-router-dom'

import { ReactComponent as Logo } from '../../assets/Logo.svg'

import * as UI from './styledComponents'

interface MenuItem {
  path: string;
  name: string;
}

interface MenuItem {
  path: string;
  name: string;
  disableIcon?: React.FC;
  enableIcon?: React.FC;
  routes?: Array<MenuItem>
  pro_layout_parentKeys?: string[];
}

export interface LayoutProps {
  menuConfig: MenuItem[];
  rightHeaderContent: React.ReactNode;
  leftHeaderContent: React.ReactNode;
  content: React.ReactNode;
}

export function Layout ({
  menuConfig,
  rightHeaderContent,
  leftHeaderContent,
  content
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const bashPathname = useTenantLink('/').pathname
  const routes = menuConfig.map((item => ({
    ...item,
    path: `${bashPathname}${item.path}`,
    routes: item.routes?.map(sub=>({
      ...sub,
      path: `${bashPathname}${sub.path}`
    }))
  })))

  const menuRender = (item: MenuItem, dom: React.ReactNode) => {
    const path = (item.routes ? item.routes[0].path : item.path) || ''
    return <NavLink to={path}>
      {({ isActive }) => {
        const Icon = isActive ? item.enableIcon : item.disableIcon
        return <>
          {(Icon && isEmpty(item.pro_layout_parentKeys) )? <Icon /> : null}
          {dom}
        </>
      }}
    </NavLink>
  }

  return <UI.Wrapper>
    <ProLayout
      breakpoint='xl'
      disableMobile={true}
      route={{ routes }}
      fixedHeader={true}
      fixSiderbar={true}
      location={location}
      menuHeaderRender={() => <Logo />}
      subMenuItemRender={menuRender}
      menuItemRender={menuRender}
      rightContentRender={() => rightHeaderContent}
      headerContentRender={() => leftHeaderContent}
      collapsedButtonRender={(collapsed: boolean) => {
        setCollapsed(collapsed)
        return <>
          {collapsed ? <UI.ArrowCollapsed /> : <UI.Arrow />}
          <UI.TextWrapper className='ant-pro-menu-item-title'>{'Collapse'}</UI.TextWrapper>
        </>
      }}
      className={collapsed ? 'sider-collapsed' : ''}
    >
      <UI.Content>{content}</UI.Content>
    </ProLayout>
  </UI.Wrapper>
}
