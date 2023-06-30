import { useEffect, useState } from 'react'

import { Menu, Dropdown, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { LayoutUI, Tooltip }                              from '@acx-ui/components'
import { get }                                            from '@acx-ui/config'
import { QuestionMarkCircleSolid, WarningCircleOutlined } from '@acx-ui/icons'
import { RolesEnum }                                      from '@acx-ui/types'
import { hasRoles }                                       from '@acx-ui/user'

import Firewall          from './Firewall'
import HelpPage          from './HelpPage'
import { ButtonWrapper } from './styledComponents'

export interface HelpButtonProps{
  supportStatus?: string
}

let timeout:NodeJS.Timeout

const HelpButton = (props:HelpButtonProps) => {
  const { supportStatus } = props
  const { $t } = useIntl()

  const [firewallModalState, setFirewallModalOpen] = useState(false)
  const [helpPageModalState, setHelpPageModalOpen] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isChatDisabled, setIsChatDisabled] = useState(true)
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])

  useEffect(()=>{
    switch (supportStatus) {
      case 'start':
        timeout=setTimeout(()=>{
          setIsBlocked(true)
        },30 * 1000) // Wait 30 secs to show the warning tooltip
        setIsChatDisabled(true)
        break
      case 'ready':
      case 'chatting':
        clearTimeout(timeout)
        setIsBlocked(false)
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
        label: $t({ defaultMessage: 'What’s New' })
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
        label: <Space>{$t({ defaultMessage: 'Contact Support' })}
          {isBlocked && <Tooltip showArrow={false}
            // eslint-disable-next-line max-len
            title={$t({ defaultMessage: 'Some browser\'s security extensions/plugins might block this feature. Please disable those extensions/plugins and try again.' })}>
            <WarningCircleOutlined style={{ marginBottom: '-5px', width: '18px', height: '18px' }}/>
          </Tooltip>}
        </Space>
      },
      {
        key: 'models',
        label: $t({ defaultMessage: 'Supported Device Models' })
      },
      ...(!(isGuestManager || isDPSKAdmin) ? [{
        key: 'firewallACL',
        label: $t({ defaultMessage: 'Firewall ACL Inputs' })
      }] : []),
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
    <Dropdown
      overlay={menuHeaderDropdown}
      trigger={['click']}
      placement='bottomLeft'
      children={<LayoutUI.ButtonSolid icon={<QuestionMarkCircleSolid />} />}
    />
    <Firewall modalState={firewallModalState} setIsModalOpen={setFirewallModalOpen} />
    <HelpPage modalState={helpPageModalState} setIsModalOpen={setHelpPageModalOpen} />
  </ButtonWrapper>
  )
}

export default HelpButton
