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
  const howToVideos = get('HOW_TO_VIDEOS')

  const isHelpEnabled = useIsSplitOn(Features.HELP_SUPPORT)

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]}
      onClick={(menuInfo)=>{
        switch(menuInfo.key)
        {
          case 'support':
            if (supportStatus === 'ready') window.tdi.chat?.()
            break
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
          case 'videos':
            window.open(howToVideos, '_blank')
            break
        }
      }}
      items={[{
        key: 'documentation',
        label: $t({ defaultMessage: 'Documentation Center' })
      },
      {
        key: 'videos',
        label: $t({ defaultMessage: 'How-To Videos' })
      },
      {
        key: 'help',
        label: $t({ defaultMessage: 'Help for this page' })
      },
      {
        key: 'support',
        disabled: isChatDisabled,
        label: $t({ defaultMessage: 'Contact Support' })
      },
      {
        key: 'models',
        label: $t({ defaultMessage: 'Supported Device Models' })
      },
      {
        key: 'firewallACL',
        label: $t({ defaultMessage: 'Firewall ACL Inputs' })
      },
      { type: 'divider' },
      {
        key: 'openCases',
        label: $t({ defaultMessage: 'My Open Cases' })
      },
      { type: 'divider' },
      {
        key: 'privacy',
        label: $t({ defaultMessage: 'Privacy' })
      }]}
    />
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
