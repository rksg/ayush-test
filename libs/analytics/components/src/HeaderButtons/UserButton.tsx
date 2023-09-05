import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import {
  useUserProfileContext,
  Tenant,
  PERMISSION_VIEW_ANALYTICS
} from '@acx-ui/analytics/utils'
import { LayoutUI, Dropdown } from '@acx-ui/components'
import { AccountCircleSolid } from '@acx-ui/icons'
import { NewTabLink }         from '@acx-ui/react-router-dom'


export const UserButton = () => {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()

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
        ...(hasViewAnalyticsPermissions ? [
          {
            key: 'my-profile',
            label: <NewTabLink to='/analytics/profile/settings'>
              {$t({ defaultMessage: 'My Profile' })}
            </NewTabLink>
          }
        ] : []),
        {
          key: 'accounts',
          label: <NewTabLink to='/analytics/profile/tenants'>
            {$t({ defaultMessage: 'Accounts' })}
          </NewTabLink>
        },
        { type: 'divider' },
        {
          key: 'logout',
          label: <Dropdown.MenuItemWithIcon>
            <LayoutUI.LogOutIcon />
            {$t({ defaultMessage: 'Log out' })}
          </Dropdown.MenuItemWithIcon>
        }
      ]}
    />
  )

  return <Dropdown overlay={menuHeaderDropdown} placement='bottomLeft' >{() =>
    userProfile.firstName && userProfile.lastName
      ? <LayoutUI.UserNameButton>
        {`${userProfile.firstName[0].toUpperCase()}${userProfile.lastName[0].toUpperCase()}`}
      </LayoutUI.UserNameButton>
      : <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
  }</Dropdown>
}
