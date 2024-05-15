import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { getUserProfile }          from '@acx-ui/analytics/utils'
import { LayoutUI, Dropdown }      from '@acx-ui/components'
import { TenantLink, useLocation } from '@acx-ui/react-router-dom'
import { hasPermission }           from '@acx-ui/user'
import { userLogout }              from '@acx-ui/utils'

export const UserButton = () => {
  const { $t } = useIntl()
  const { firstName, lastName } = getUserProfile()
  const location = useLocation()

  const menuHeaderDropdown = (
    <Menu
      selectedKeys={[]}
      onClick={(menuInfo) => {
        switch (menuInfo.key) {
          case 'logout':
            userLogout()
            break
        }
      }}
      items={[
        ...(hasPermission({ permission: 'READ_INCIDENTS' }) ? [ // TODO language setting
          {
            key: 'my-profile',
            label: <TenantLink
              to='/profile/settings'
              state={{ from: location.pathname }}
            >
              {$t({ defaultMessage: 'My Profile' })}
            </TenantLink>
          }
        ] : []),
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
      {`${(firstName[0]||'').toUpperCase()}${(lastName[0]||'').toUpperCase()}`}
    </LayoutUI.UserNameButton>
  }</Dropdown>
}
