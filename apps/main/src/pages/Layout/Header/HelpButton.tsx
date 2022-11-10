import React from 'react'

import { LogoutOutlined } from '@ant-design/icons'
import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import {
  LayoutUI
}                        from '@acx-ui/components'
import {  QuestionMarkCircleSolid } from '@acx-ui/icons'

const HelpButton = () => {
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
    <Dropdown overlay={menuHeaderDropdown} placement='bottomLeft'>
      <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
    </Dropdown>
  )
}

export default HelpButton
