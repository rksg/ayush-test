import { useIntl } from 'react-intl'

import { Card, SummaryCard, Tabs }            from '@acx-ui/components'
import { SdLanTopologyDiagram, SpaceWrapper } from '@acx-ui/rc/components'
import {
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation,
  EdgeSdLanViewDataP2
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

import { NetworkTable }    from './NetworkTable'
import { SmartEdgesTable } from './SmartEdgesTable'
import * as UI             from './styledComponents'

export const DmzSdLanDetailContent = (props: {
  data: EdgeSdLanViewDataP2
}) => {
  const { data } = props
  const { $t } = useIntl()

  const sdLanInfo = [{
    title: $t({ defaultMessage: 'Venue' }),
    content: () => ((data.venueId)
      ? <TenantLink to={`/venues/${data.venueId}/venue-details/overview`}>
        {data.venueName}
      </TenantLink>
      : noDataDisplay
    )
  }, {
    title: $t({ defaultMessage: 'Cluster' }),
    content: () => (
      <TenantLink to={`devices/edge/cluster/${data.edgeClusterId}/edit/cluster-details`}>
        {data.edgeClusterName}
      </TenantLink>
    )
  }, {
    title: $t({ defaultMessage: 'DMZ Cluster' }),
    content: () => (
      <TenantLink to={`devices/edge/cluster/${data.guestEdgeClusterId}/edit/cluster-details`}>
        {data.guestEdgeClusterName}
      </TenantLink>
    )
  }, {
    title: $t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' }),
    colSpan: 6,
    content: () => (
      <TenantLink to={getPolicyDetailsLink({
        type: PolicyType.TUNNEL_PROFILE,
        oper: PolicyOperation.DETAIL,
        policyId: data.tunnelProfileId!
      })}>
        {data.tunnelProfileName}
      </TenantLink>
    )
  }, {
    title: $t({ defaultMessage: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' }),
    colSpan: 6,
    content: () => (
      <TenantLink to={getPolicyDetailsLink({
        type: PolicyType.TUNNEL_PROFILE,
        oper: PolicyOperation.DETAIL,
        policyId: data.guestTunnelProfileId!
      })}>
        {data.guestTunnelProfileName}
      </TenantLink>
    )
  }]

  return <SpaceWrapper fullWidth direction='vertical' size={30}>
    <SummaryCard data={sdLanInfo} />
    <Card>
      <SdLanTopologyDiagram
        isGuestTunnelEnabled={true}
        vertical={false}
      />
    </Card>
    <Card>
      <UI.InstancesContainer>
        <UI.InstancesTitle level={2}>
          {$t({ defaultMessage: 'Instances' })}
        </UI.InstancesTitle>
      </UI.InstancesContainer>
      <Tabs type='third'>
        <Tabs.TabPane
          tab={$t(
            { defaultMessage: 'Networks({count})' },
            { count: data.networkIds.length }
          )}
          key='networks'
        >
          <NetworkTable
            networkIds={data.networkIds}
            guestNetworkIds={data.guestNetworkIds}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'SmartEdges({count})' }, { count: 2 })}
          key='se'
        >
          <SmartEdgesTable sdLanData={data} />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </SpaceWrapper>
}