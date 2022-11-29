import { useState } from 'react'

import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { LayoutUI }                from '@acx-ui/components'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'

import About    from './About'
import Firewall from './Firewall'

const UserButton = () => {
  const { $t } = useIntl()
  const [aboutModalState, setAboutModalOpen] = useState(false)
  const [firewallModalState, setFirewallModalOpen] = useState(false)

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]}
      onClick={(menuInfo)=>{
        switch(menuInfo.key)
        {
          case 'about':
            setAboutModalOpen(true)
            break
          case 'firewallACL':
            setFirewallModalOpen(true)
            break
        }
      }}>
      <Menu.Item disabled key='documentation'>
        {$t({ defaultMessage: 'Documentation Center' })}
      </Menu.Item>

      <Menu.Item disabled key='videos'>
        {$t({ defaultMessage: 'How-To Videos' })}
      </Menu.Item>

      <Menu.Item disabled key='help'>
        {$t({ defaultMessage: 'Help for this page' })}
      </Menu.Item>

      <Menu.Item disabled key='models'>
        {$t({ defaultMessage: 'Supported Device Models' })}
      </Menu.Item>

      <Menu.Item key='firewallACL'>
        {$t({ defaultMessage: 'Firewall ACL Inputs' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item disabled key='openCases'>
        {$t({ defaultMessage: 'My Open Cases' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item disabled key='privacy'>
        {$t({ defaultMessage: 'Privacy' })}
      </Menu.Item>

      <Menu.Item key='about'>
        {$t({ defaultMessage: 'About RUCKUS One' })}
      </Menu.Item>
    </Menu>
  )

  return (<>
    <Dropdown overlay={menuHeaderDropdown} trigger={['click']} placement='bottomLeft'>
      <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />
    </Dropdown>
    <About modalState={aboutModalState} setIsModalOpen={setAboutModalOpen}/>
    <Firewall modalState={firewallModalState} setIsModalOpen={setFirewallModalOpen}/>
  </>
  )
}

export default UserButton
