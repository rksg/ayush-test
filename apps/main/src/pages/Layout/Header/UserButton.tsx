import React from 'react'

import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { useGetUserProfileQuery } from '@acx-ui/rc/services'
import { useParams }              from '@acx-ui/react-router-dom'

import { UserNameButton, LogOut } from './styledComponents'

const UserButton = () => {
  const { $t } = useIntl()

  const params = useParams()
  const { data } = useGetUserProfileQuery({ params })

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]}
      onClick={(menuInfo)=>{
        if(menuInfo.key==='logout'){
          window.location.href = '/logout'
        }
      }}>
      <Menu.Item disabled key='center'>
        {$t({ defaultMessage: 'User Profile' })}
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
        {data?.firstName.substring(0,1)}
        {data?.lastName.substring(0,1)}</UserNameButton>
    </Dropdown>
  )
}

export default UserButton
