import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import {
  useUserProfileContext,
  Tenant,
  PERMISSION_VIEW_ANALYTICS
} from '@acx-ui/analytics/utils'
import { LayoutUI }                from '@acx-ui/components'
import { AccountCircleSolid }      from '@acx-ui/icons'
import { TenantLink, useLocation } from '@acx-ui/react-router-dom'

import { LogOut } from './styledComponents'

export const UserButton = () => {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const location = useLocation()

  const currentAccountPermissions = userProfile?.tenants?.filter(
    // Hardcoded to current account for now
    (tenent: Tenant) => tenent.id === userProfile?.accountId
  )[0].permissions
  const hasViewAnalyticsPermissions = currentAccountPermissions?.[PERMISSION_VIEW_ANALYTICS]

  const menuHeaderDropdown = (
    <Menu
      selectedKeys={[]}
      onClick={(menuInfo) => {
        switch (menuInfo.key) {
          case 'logout':
            const token = sessionStorage.getItem('jwt') ?? null
            window.location.href = token ? `/logout?token=${token}` : '/logout'
            sessionStorage.removeItem('jwt')
            window.location.href = token ? `/logout?token=${token}` : '/logout'
            break
        }
      }}
      items={[
        ...(hasViewAnalyticsPermissions
          ? [
            {
              key: 'my-profile',
              label: (
                <TenantLink state={{ from: location.pathname }} to='/userprofile/'>
                  {$t({ defaultMessage: 'My Profile' })}{' '}
                </TenantLink>
              )
            }
          ]
          : []),
        {
          key: 'accounts',
          label: (
            <TenantLink state={{ from: location.pathname }} to='/accounts/'>
              {$t({ defaultMessage: 'Accounts' })}{' '}
            </TenantLink>
          )
        },
        { type: 'divider' },
        {
          key: 'logout',
          label: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <LogOut />
              <span>{$t({ defaultMessage: 'Log out' })} </span>
            </div>
          )
        }
      ]}
    />
  )

  return (
    <Dropdown
      overlay={menuHeaderDropdown}
      trigger={['click']}
      placement='bottomLeft'
    >
      <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
    </Dropdown>
  )
}
