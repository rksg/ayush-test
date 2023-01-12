import { useState } from 'react'

import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { Tooltip }                 from '@acx-ui/components'
import { LayoutUI }                from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'
import { notAvailableMsg }         from '@acx-ui/utils'

// import About    from './About'
import { DisabledButton } from '../styledComponents'

import Firewall from './Firewall'
import HelpPage from './HelpPage'



const UserButton = () => {
  const { $t } = useIntl()
  // const [aboutModalState, setAboutModalOpen] = useState(false)
  const [firewallModalState, setFirewallModalOpen] = useState(false)
  const [helpPageModalState, setHelpPageModalOpen] = useState(false)

  const isHelpEnabled = useIsSplitOn(Features.HELP_SUPPORT)

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]}
      onClick={(menuInfo)=>{
        switch(menuInfo.key)
        {
          case 'help':
            setHelpPageModalOpen(true)
            break
          case 'firewallACL':
            setFirewallModalOpen(true)
            break
        }
      }}
    >
      <Menu.Item disabled key='documentation'>
        {$t({ defaultMessage: 'Documentation Center' })}
      </Menu.Item>

      <Menu.Item disabled key='videos'>
        {$t({ defaultMessage: 'How-To Videos' })}
      </Menu.Item>

      <Menu.Item key='help'>
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

      {/* <Menu.Item key='about'>
        {$t({ defaultMessage: 'About RUCKUS One' })}
      </Menu.Item> */}
    </Menu>
  )

  return (<>
    <Dropdown disabled={!isHelpEnabled}
      overlay={menuHeaderDropdown}
      trigger={['click']}
      placement='bottomLeft'>

      <Tooltip title={isHelpEnabled ? '' : $t(notAvailableMsg)}>
        {isHelpEnabled ? <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} /> :
          <DisabledButton disabled icon={<QuestionMarkCircleSolid />} />}
      </Tooltip>
    </Dropdown>
    {/* <About modalState={aboutModalState} setIsModalOpen={setAboutModalOpen}/> */}
    <Firewall modalState={firewallModalState} setIsModalOpen={setFirewallModalOpen}/>
    <HelpPage modalState={helpPageModalState} setIsModalOpen={setHelpPageModalOpen}/>
  </>
  )
}

export default UserButton
