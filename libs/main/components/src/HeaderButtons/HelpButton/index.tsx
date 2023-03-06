import { useEffect, useState } from 'react'

import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { Tooltip }                 from '@acx-ui/components'
import { LayoutUI }                from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'
import { notAvailableMsg }         from '@acx-ui/utils'

import { DisabledButton } from '../styledComponents'


import Firewall          from './Firewall'
import HelpPage          from './HelpPage'
import { ButtonWrapper } from './styledComponents'

export interface HelpButtonProps{
  supportStatus?: string
}

const HelpButton = (props:HelpButtonProps) => {
  const { supportStatus } = props
  const { $t } = useIntl()

  const [firewallModalState, setFirewallModalOpen] = useState(false)
  const [helpPageModalState, setHelpPageModalOpen] = useState(false)
  const [isChatDisabled, setIsChatDisabled] = useState(true)

  useEffect(()=>{
    switch (supportStatus) {
      case 'ready':
        setIsChatDisabled(false)
        break
      case 'chatting':
        setIsChatDisabled(false)
        break
      default:
        setIsChatDisabled(true)
        break
    }
  },[supportStatus])

  const documentationCenter = get('DOCUMENTATION_CENTER')
  const myOpenCases = get('MY_OPEN_CASES')
  const privacy = get('PRIVACY')
  const supportedAPModels = get('SUPPORTED_AP_MODELS')

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
          case 'models':
            window.open(supportedAPModels, '_blank')
            break
          case 'privacy':
            window.open(privacy, '_blank')
            break
          case 'openCases':
            window.open(myOpenCases, '_blank')
            break
          case 'documentation':
            window.open(documentationCenter, '_blank')
            break
        }
      }}
    >
      <Menu.Item key='documentation'>
        {$t({ defaultMessage: 'Documentation Center' })}
      </Menu.Item>

      <Menu.Item disabled key='videos'>
        {$t({ defaultMessage: 'How-To Videos' })}
      </Menu.Item>

      <Menu.Item key='help'>
        {$t({ defaultMessage: 'Help for this page' })}
      </Menu.Item>

      <Menu.Item disabled={isChatDisabled}
        onClick={()=>{
          if(supportStatus === 'ready' && window.tdi.chat){
            window.tdi.chat()
          }
        }}
        key='support'>
        {$t({ defaultMessage: 'Contact Support' })}
      </Menu.Item>

      <Menu.Item key='models'>
        {$t({ defaultMessage: 'Supported Device Models' })}
      </Menu.Item>

      <Menu.Item key='firewallACL'>
        {$t({ defaultMessage: 'Firewall ACL Inputs' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item key='openCases'>
        {$t({ defaultMessage: 'My Open Cases' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item key='privacy'>
        {$t({ defaultMessage: 'Privacy' })}
      </Menu.Item>

    </Menu>
  )

  return (<ButtonWrapper>
    <Dropdown disabled={!isHelpEnabled}
      overlay={menuHeaderDropdown}
      trigger={['click']}
      placement='bottomLeft'>
      <Tooltip title={isHelpEnabled ? '' : $t(notAvailableMsg)}>
        {isHelpEnabled ? <LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} /> :
          <DisabledButton disabled icon={<QuestionMarkCircleSolid />} />}
      </Tooltip>
    </Dropdown>
    <Firewall modalState={firewallModalState} setIsModalOpen={setFirewallModalOpen}/>
    <HelpPage modalState={helpPageModalState} setIsModalOpen={setHelpPageModalOpen}/>
  </ButtonWrapper>
  )
}

export default HelpButton
