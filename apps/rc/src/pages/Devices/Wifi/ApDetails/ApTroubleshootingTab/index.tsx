import { useIntl }                from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'

import { Tabs }          from '@acx-ui/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { ApPacketCaptureForm } from './apPacketCaptureForm'
import { ApPingForm }          from './apPingForm'
import { ApTraceRouteForm }    from './apTraceRouteForm'

const { TabPane } = Tabs

export function ApTroubleshootingTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/aps/${params.serialNumber}/details/troubleshooting/`)

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
      activeKey={params.activeSubTab}
      type='card'
    >
      <TabPane tab={$t({ defaultMessage: 'Ping' })} key='ping'>
        <ApPingForm/>
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Traceroute' })} key='traceroute'>
        <ApTraceRouteForm/>
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Packet Capture' })} key='packetCapture'>
        <ApPacketCaptureForm/>
      </TabPane>
    </Tabs>
  )
}
