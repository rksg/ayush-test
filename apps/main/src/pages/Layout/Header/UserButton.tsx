import React from 'react'

import { LogoutOutlined } from '@ant-design/icons'
import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { UserNameButton } from './styledComponents'

const UserButton = () => {
  const { $t } = useIntl()

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]} onClick={()=>{}}>
      <Menu.Item key='center'>
        {$t({ defaultMessage: 'User Profile' })}
      </Menu.Item>

      <Menu.Item key='settings'>
        {$t({ defaultMessage: 'Change Password' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item key='logout'>
        <LogoutOutlined />
        {$t({ defaultMessage: 'Log out' })}
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menuHeaderDropdown} trigger={['click']} placement='bottomLeft'>
      <UserNameButton>JS</UserNameButton>
    </Dropdown>
  )
}

export default UserButton
