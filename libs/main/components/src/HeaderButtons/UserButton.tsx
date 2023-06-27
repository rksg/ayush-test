import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { LayoutUI }                from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { AccountCircleSolid }      from '@acx-ui/icons'
import { TenantLink, useLocation } from '@acx-ui/react-router-dom'
import { useUserProfileContext }   from '@acx-ui/user'

import { UserNameButton, LogOut } from './styledComponents'

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
          label: <div style={{ display: 'flex', alignItems: 'center' }}>
            <LogOut/>
            <span>{$t({ defaultMessage: 'Log out' })}  </span>
          </div>
        }
      ]}
    />
  )

  return (
    <Dropdown overlay={menuHeaderDropdown} trigger={['click']} placement='bottomLeft'>
      {
        userProfile?.initials
          ? <UserNameButton>{userProfile.initials}</UserNameButton>
          : <LayoutUI.ButtonSolid icon={<AccountCircleSolid />} />
      }
    </Dropdown>
  )
}

export default UserButton
