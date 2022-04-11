import React, { useState } from 'react'
import ProLayout           from '@ant-design/pro-layout'
import { Link }            from 'react-router-dom'

import { ReactComponent as Logo } from 'src/assets/icons/Logo.svg'
import { getTenantId }            from 'src/utils/rc'
import * as UI                    from './styledComponents'

export const routeToPath = (pathname: string) => {
  const tenantId = getTenantId()
  const routeParams = {
    ...window.location,
    pathname: pathname
  }
  if (tenantId) {
    routeParams.search = '?tenant=' + tenantId
  }
  return routeParams
}

interface menuItem {
  path: string;
  name: string;
  disableIcon?: React.ReactNode;
  enableIcon?: React.ReactNode;
}

function Layout ({
  initPath,
  menuConfig,
  rightHeaderContent,
  leftHeaderContent,
  content
}: {
  initPath: string;
  menuConfig: menuItem[];
  rightHeaderContent: React.ReactNode;
  leftHeaderContent: React.ReactNode;
  content: React.ReactNode;
}) {
  const [pathname, setPathname] = useState(initPath)
  const [collapsed, setCollapsed] = useState(false)
  return <UI.Wrapper>
    <ProLayout
      route={{ routes: menuConfig }}
      fixedHeader={true}
      fixSiderbar={true}
      location={{ pathname }}
      menuHeaderRender={() => <Logo />}
      menuItemRender={(item, dom) => {
        const Icon = pathname === item.path ? item.enableIcon : item.disableIcon
        return (
          <Link
            onClick={() => { setPathname(item.path || '') }}
            to={routeToPath(item.path || '')}
          >
            {Icon ? <Icon /> : null}
            {dom}
          </Link>
        )
      }}
      rightContentRender={() => rightHeaderContent}
      headerContentRender={() => leftHeaderContent}
      collapsedButtonRender={(collapsed) => {
        setCollapsed(collapsed as boolean)
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

export default Layout
