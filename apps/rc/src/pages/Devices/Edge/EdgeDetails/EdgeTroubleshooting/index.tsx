import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }          from '@acx-ui/components'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { EdgePingForm }       from './edgePingForm'
import { EdgeTraceRouteForm } from './edgeTraceRouteForm'

const { TabPane } = Tabs

export function EdgeTroubleshooting () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${params.serialNumber}/details/troubleshooting/`)
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
      type='second'
    >
      <TabPane tab={$t({ defaultMessage: 'Ping' })} key='ping'>
        <EdgePingForm/>
      </TabPane>
      <TabPane tab={$t({ defaultMessage: 'Traceroute' })} key='traceroute'>
        <EdgeTraceRouteForm/>
      </TabPane>
    </Tabs>
  )
}
