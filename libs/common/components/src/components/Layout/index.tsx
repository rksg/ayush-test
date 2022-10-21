import React, { useState } from 'react'

import ProLayout             from '@ant-design/pro-layout'
import { Tooltip }           from 'antd'
import { isEmpty, uniqueId } from 'lodash'
import { useIntl }           from 'react-intl'

import { Logo }   from '@acx-ui/icons'
import {
  TenantType,
  useLocation,
  useTenantLink,
  TenantNavLink
}                          from '@acx-ui/react-router-dom'
import { notAvailableMsg } from '@acx-ui/utils'

import * as UI from './styledComponents'

interface MenuItem {
  path: string
  uri?: string
  name: string
  tenantType?: TenantType
  inactiveIcon?: React.FC
  activeIcon?: React.FC
  routes?: Array<MenuItem>
  pro_layout_parentKeys?: string[]
  disabled?: boolean
}

export interface LayoutProps {
  menuConfig: MenuItem[];
  rightHeaderContent: React.ReactNode;
  leftHeaderContent?: React.ReactNode;
  content: React.ReactNode;
}

export const genPlaceholder = () => ({
  path: `/${uniqueId()}/placeholder`,
  name: ' '
})

export function Layout ({
  menuConfig: routes,
  rightHeaderContent,
  leftHeaderContent,
  content
}: LayoutProps) {
  const { $t } = useIntl()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const basePath = useTenantLink('/')
  const mspBasePath = useTenantLink('/', 'v')
  const newRoutes = routes.map((item => {
    const base = item.tenantType === 'v' ? mspBasePath : basePath
    return {
      ...item,
      path: `${base.pathname}${item.path}`,
      uri: item.path,
      routes: item.routes?.map(sub=>({
        ...sub,
        path: `${base.pathname}${sub.path}`,
        uri: sub.path
      }))
    }
  }))
  const menuRender = (item: MenuItem, dom: React.ReactNode) => {
    const link = <TenantNavLink to={item.uri!} tenantType={item.tenantType}>
      {({ isActive }) => {
        let icon: JSX.Element | undefined
        if (isActive) {
          const IconComponent = item.activeIcon as React.FC
          icon = <UI.MenuIconSolid children={<IconComponent />} />
        } else {
          const IconComponent = item.inactiveIcon
          if (IconComponent) icon = <UI.MenuIconOutlined children={<IconComponent />} />
        }
        return <>
          {(icon && isEmpty(item.pro_layout_parentKeys)) ? icon : null}
          {dom}
        </>
      }}
    </TenantNavLink>
    return item.disabled
      ? <Tooltip placement='right' title={$t(notAvailableMsg)}>
        {/* workaround for showing tooltip when link disabled */}
        <span>{link}</span>
      </Tooltip>
      : link
  }

  return <UI.Wrapper>
    <ProLayout
      breakpoint='xl'
      disableMobile={true}
      route={{ routes: newRoutes }}
      fixedHeader={true}
      fixSiderbar={true}
      location={location}
      menuHeaderRender={() => <Logo />}
      subMenuItemRender={menuRender}
      menuItemRender={menuRender}
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
