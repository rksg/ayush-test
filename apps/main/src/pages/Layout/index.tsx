import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { Tooltip } from '@acx-ui/components'
import {
  Layout as LayoutComponent,
  LayoutUI,
  Dropdown
}                        from '@acx-ui/components'
import { SplitProvider }    from '@acx-ui/feature-toggle'
import {
  AccountCircleSolid,
  Logout,
  QuestionMarkCircleSolid
}                          from '@acx-ui/icons'
import { AlarmsHeaderButton }              from '@acx-ui/main/components'
import { Outlet, TenantLink, useLocation } from '@acx-ui/react-router-dom'
import { notAvailableMsg }                 from '@acx-ui/utils'

import { useMenuConfig } from './menuConfig'
import SearchBar         from './SearchBar'

function Layout () {
  const location = useLocation()
  const userMenu = <Menu
    items={[
      { key: 'user-profile',
        label: <TenantLink
          state={{ from: location.pathname }}
          to='/userprofile/'>{useIntl().$t({ defaultMessage: 'User Profile' })}
        </TenantLink>
      },
      { key: 'change-password',
        disabled: true,
        label: <TenantLink to='TODO'>{useIntl().$t({ defaultMessage: 'Change Password' })}
        </TenantLink>
      },
      { type: 'divider' },
      { key: 'logout',
        disabled: true,
        icon: <Logout/>,
        label: <TenantLink to='TODO'>{useIntl().$t({ defaultMessage: 'Log out' })}</TenantLink>
      }
    ]}
  />

  return (
    <LayoutComponent
      menuConfig={useMenuConfig()}
      content={<Outlet />}
      rightHeaderContent={<>
        <SearchBar />
        <LayoutUI.Divider />
        <AlarmsHeaderButton />
        <Tooltip placement='bottomRight' title={useIntl().$t(notAvailableMsg)}>
          <LayoutUI.ButtonSolid disabled icon={<QuestionMarkCircleSolid />} />
        </Tooltip>
        <Dropdown overlay={userMenu}>{() =>
          <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
        }</Dropdown>

      </>}
    />
  )
}

function LayoutWithSplitProvider () {
  return <SplitProvider>
    <Layout />
  </SplitProvider>
}

export default LayoutWithSplitProvider
