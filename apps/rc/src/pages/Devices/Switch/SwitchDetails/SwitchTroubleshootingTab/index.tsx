import { useIntl }                from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'

import { Tabs }          from '@acx-ui/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchPacketCaptureForm } from './switchPacketCaptureForm'
import { SwitchPingForm }          from './switchPingForm'
import { SwitchTraceRouteForm }    from './switchTraceRouteForm'

const { TabPane } = Tabs

export function SwitchTroubleshootingTab () {
  const { $t } = useIntl()
  const {switchId, serialNumber, activeSubTab } = useParams()
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const basePath = useTenantLink(`/devices/switch/${switchId}/${serialNumber}/details/troubleshooting/`)

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='ping'
      activeKey={activeSubTab}
      type='card'
    >
      <TabPane tab={$t({ defaultMessage: 'Ping' })} key='ping'>
        <SwitchPingForm/>
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Traceroute' })} key='traceroute'>
        <SwitchTraceRouteForm/>
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'IP Route' })} key='ipRoute'>
        <SwitchPacketCaptureForm/>
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'MAC Address Table' })} key='macTable'>
        <SwitchPacketCaptureForm/>
      </TabPane>
    </Tabs>
  )
}
