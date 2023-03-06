import { useEffect, useState } from 'react'

import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { Tooltip }                 from '@acx-ui/components'
import { LayoutUI }                from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'
import { useGetGlobalValuesQuery } from '@acx-ui/user'
import { useParams  }              from '@acx-ui/react-router-dom'
import { notAvailableMsg }         from '@acx-ui/utils'

import { DisabledButton } from '../styledComponents'


import Firewall          from './Firewall'
import HelpPage          from './HelpPage'
import { ButtonWrapper } from './styledComponents'

// eslint-disable-next-line max-len
const DOCUMENTATION_CENTER = 'https://docs.cloud.ruckuswireless.com/alto/master--1-220111/index.html'
export interface HelpButtonProps{
  supportStatus?: string
}

const HelpButton = (props:HelpButtonProps) => {
  const { supportStatus } = props
  const { $t } = useIntl()

  const [firewallModalState, setFirewallModalOpen] = useState(false)
  const [helpPageModalState, setHelpPageModalOpen] = useState(false)
  const [isChatDisabled, setIsChatDisabled] = useState(true)

  const params = useParams()
  const { data } = useGetGlobalValuesQuery({ params })
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
            if(data?.SUPPORTED_AP_MODELS) window.open(data?.SUPPORTED_AP_MODELS, '_blank')
            break
          case 'privacy':
            if(data?.PRIVACY) window.open(data?.PRIVACY, '_blank')
            break
          case 'openCases':
            if(data?.MY_OPEN_CASES) window.open(data?.MY_OPEN_CASES, '_blank')
            break
          case 'documentation':
            window.open(DOCUMENTATION_CENTER, '_blank')
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

      <Menu.Item disabled={!data?.SUPPORTED_AP_MODELS} key='models'>
        {$t({ defaultMessage: 'Supported Device Models' })}
      </Menu.Item>

      <Menu.Item key='firewallACL'>
        {$t({ defaultMessage: 'Firewall ACL Inputs' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item disabled={!data?.MY_OPEN_CASES} key='openCases'>
        {$t({ defaultMessage: 'My Open Cases' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item disabled={!data?.PRIVACY} key='privacy'>
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
