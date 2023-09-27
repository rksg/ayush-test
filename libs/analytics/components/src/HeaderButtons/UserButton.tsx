import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import {
  useUserProfileContext,
  PERMISSION_VIEW_ANALYTICS
} from '@acx-ui/analytics/utils'
import { LayoutUI, Dropdown } from '@acx-ui/components'
import { NewTabLink }         from '@acx-ui/react-router-dom'


export const UserButton = () => {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const hasViewAnalyticsPermissions = userProfile.permissions[PERMISSION_VIEW_ANALYTICS]

  const menuHeaderDropdown = (
    <Menu
      selectedKeys={[]}
      onClick={(menuInfo) => {
        switch (menuInfo.key) {
          case 'logout':
            const form = document.createElement('form')
            form.action = '/analytics/api/auth/v1/user/logout'
            form.method = 'POST'
            document.body.appendChild(form)
            form.submit()
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
    <LayoutUI.UserNameButton>
      {`${userProfile.firstName[0].toUpperCase()}${userProfile.lastName[0].toUpperCase()}`}
    </LayoutUI.UserNameButton>
  }</Dropdown>
}
