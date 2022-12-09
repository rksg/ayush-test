import React from 'react'

import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { useGetUserProfileQuery }              from '@acx-ui/rc/services'
import { useParams, TenantLink, useLocation  } from '@acx-ui/react-router-dom'

import { UserNameButton, LogOut } from './styledComponents'

const UserButton = () => {
  const { $t } = useIntl()

  const params = useParams()
  const { data } = useGetUserProfileQuery({ params })
  const location = useLocation()

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]}
      onClick={(menuInfo)=>{
        if(menuInfo.key==='logout'){
          window.location.href = '/logout'
        }
      }}>
      <Menu.Item
        key='center'>
        <TenantLink
          state={{ from: location.pathname }}
          to='/userprofile/'>{useIntl().$t({ defaultMessage: 'User Profile' })}
        </TenantLink>
      </Menu.Item>

      <Menu.Item disabled key='settings'>
        {$t({ defaultMessage: 'Change Password' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item key='logout'>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LogOut/>
          <span>{$t({ defaultMessage: 'Log out' })}  </span>
        </div>
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menuHeaderDropdown} trigger={['click']} placement='bottomLeft'>
      <UserNameButton>
        {data?.initials}</UserNameButton>
    </Dropdown>
  )
}

export default UserButton
