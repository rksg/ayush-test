import { useIntl } from 'react-intl'

import { Card, Tabs }                            from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchOverviewACLs }            from './SwitchOverviewACLs'
import { SwitchOverviewPanel }           from './SwitchOverviewPanel'
import { SwitchOverviewPorts }           from './SwitchOverviewPorts'
import { SwitchOverviewRouteInterfaces } from './SwitchOverviewRouteInterfaces'
import { SwitchOverviewVLANs }           from './SwitchOverviewVLANs'

export function SwitchOverviewTab () {
  const { $t } = useIntl()
  const params = useParams()
  const { activeSubTab } = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(
    `/devices/switch/${params.switchId}/${params.serialNumber}/details/overview/`
  )

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return <>
    <Card type='solid-bg'>
      {$t({ defaultMessage: 'Overview widget' })}
    </Card>

    <Tabs onChange={onTabChange}
      activeKey={activeSubTab}
      type='card'
      style={{ marginTop: '25px' }}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Panel' })} key='panel'>
        <SwitchOverviewPanel />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Ports' })} key='ports'>
        <SwitchOverviewPorts />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Route Interfaces' })} key='routeInterfaces'>
        <SwitchOverviewRouteInterfaces />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'VLANs' })} key='vlans'>
        <SwitchOverviewVLANs />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'ACLs' })} key='acls'>
        <SwitchOverviewACLs />
      </Tabs.TabPane>
    </Tabs>
  </>
}
