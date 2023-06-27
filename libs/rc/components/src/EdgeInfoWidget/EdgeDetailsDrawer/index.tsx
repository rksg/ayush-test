/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, Drawer }                  from '@acx-ui/components'
import { EdgeDnsServers, EdgePasswordDetail, EdgePortStatus, EdgeStatus } from '@acx-ui/rc/utils'


import { Properties } from './Properties'
import { Settings }   from './Settings'

interface EdgeDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentEdge: EdgeStatus | undefined,
  edgePortsSetting: EdgePortStatus[] | undefined
  dnsServers: EdgeDnsServers | undefined
  passwordDetail: EdgePasswordDetail | undefined
}

const EdgeDetailsDrawer = (props: EdgeDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentEdge, edgePortsSetting, dnsServers, passwordDetail } = props

  const onClose = () => {
    setVisible(false)
  }

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Properties' }),
      value: 'properties',
      children: <Properties currentEdge={currentEdge} passwordDetail={passwordDetail} />
    },
    {
      label: $t({ defaultMessage: 'Settings' }),
      value: 'settings',
      children: <Settings
        edgePortsSetting={edgePortsSetting}
        dnsSetting={dnsServers}
      />
    }
  ]

  const content = <ContentSwitcher tabDetails={tabDetails} size='small' />

  return (
    <Drawer
      title={$t({ defaultMessage: 'SmartEdge Details' })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'400px'}
    />
  )
}

export default EdgeDetailsDrawer