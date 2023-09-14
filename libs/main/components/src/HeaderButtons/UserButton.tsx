import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { LayoutUI, Dropdown }      from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { AccountCircleSolid }      from '@acx-ui/icons'
import { TenantLink, useLocation } from '@acx-ui/react-router-dom'
import { useUserProfileContext }   from '@acx-ui/user'

const UserButton = () => {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const location = useLocation()

  const menuHeaderDropdown = (
    <Menu
      selectedKeys={[]}
      onClick={(menuInfo) => {
        switch (menuInfo.key) {
          case 'change-password':
            const passwordUrl = get('CHANGE_PASSWORD')
            const isRwbigdog = userProfile?.email.indexOf('@rwbigdog.com') !== -1 ||
                               userProfile?.username.indexOf('@rwbigdog.com') !== -1
            const changePasswordUrl = isRwbigdog
              ? 'https://partners.ruckuswireless.com/forgot-password'
              : passwordUrl
            window.open(changePasswordUrl, '_blank')
            break
          case 'logout':
            const token = sessionStorage.getItem('jwt')?? null
            sessionStorage.removeItem('jwt')
            window.location.href = token? `/logout?token=${token}` : '/logout'
            break
        }
      }}
      items={[
        {
          key: 'user-profile',
          label: <TenantLink
            state={{ from: location.pathname }}
            to='/userprofile/'>{useIntl().$t({ defaultMessage: 'User Profile' })}
          </TenantLink>
        },
        {
          key: 'change-password',
          label: $t({ defaultMessage: 'Change Password' })
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

  return <Dropdown overlay={menuHeaderDropdown} placement='bottomLeft'>{() =>
    userProfile?.initials
      ? <LayoutUI.UserNameButton>{userProfile.initials}</LayoutUI.UserNameButton>
      : <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
  }</Dropdown>
}

export default UserButton
