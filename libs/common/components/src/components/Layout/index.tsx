import React, { useState } from 'react'

import ProLayout    from '@ant-design/pro-layout'
import { Menu }     from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { useIntl }  from 'react-intl'

import { Logo }                                   from '@acx-ui/icons'
import { TenantType, useLocation, TenantNavLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export type MenuItem = ItemType & {
  uri?: string
  tenantType?: TenantType
  activeIcon?: React.FC
  inactiveIcon?: React.FC
  isActivePattern?: string[]
  children?: MenuItem[]
}

export interface LayoutProps {
  menuConfig: MenuItem[];
  bottomMenuConfig?: MenuItem[];
  rightHeaderContent: React.ReactNode;
  leftHeaderContent?: React.ReactNode;
  content: React.ReactNode;
}

interface SiderMenuProps {
  menuConfig: MenuItem[]
}

function SiderMenu (props: SiderMenuProps) {
  const location = useLocation()
  const breakpoint = /\/t\/\w+/
  const activeUri = location.pathname.split(breakpoint)?.[1]

  const getLabel = (item: MenuItem) => ('label' in item) ? item.label : ''
  function getMenuItem (item: MenuItem): MenuItem {
    const { uri, tenantType, activeIcon, inactiveIcon, isActivePattern, children, ...rest } = item
    const isActive = isActivePattern?.some(pattern => activeUri?.includes(pattern))
    const IconComponent = (isActive ? activeIcon : inactiveIcon)as React.FC
    const content = <div className={Boolean(isActive) ? 'menu-active' : 'menu-inactive'}>
      {IconComponent &&
      (isActive
        ? <UI.MenuIconSolid children={<IconComponent />} />
        : <UI.MenuIconOutlined children={<IconComponent />} />)
      }
      {getLabel(item)}
    </div>
    return {
      ...rest,
      label: uri
        ? <TenantNavLink to={uri} tenantType={tenantType}>{content}</TenantNavLink>
        : content,
      children: children?.map(getMenuItem)
    } as MenuItem
  }
  return <Menu selectedKeys={[]} items={props.menuConfig.map(getMenuItem)}/>
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

  // const menuRender = (item: MenuItem, dom: React.ReactNode) => {
  //   const link = <TenantNavLink to={item.uri!} tenantType={item.tenantType}>
  //     {({ isActive }) => {
  //       let icon: JSX.Element | undefined
  //       if (isActive) {
  //         const IconComponent = item.activeIcon as React.FC
  //         icon = <UI.MenuIconSolid children={<IconComponent />} />
  //       } else {
  //         const IconComponent = item.inactiveIcon
  //         if (IconComponent) icon = <UI.MenuIconOutlined children={<IconComponent />} />
  //       }
  //       return <>
  //         {(icon && isEmpty(item.pro_layout_parentKeys)) ? icon : null}
  //         {dom}
  //       </>
  //     }}
  //   </TenantNavLink>
  //   return item.disabled
  //     ? <Tooltip placement='right' title={$t(notAvailableMsg)}>
  //       {/* workaround for showing tooltip when link disabled */}
  //       <span>{link}</span>
  //     </Tooltip>
  //     : link
  // }

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
          tenantType={menuConfig.find(({ uri })=> uri === '/dashboard')?.tenantType || 't'}
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
