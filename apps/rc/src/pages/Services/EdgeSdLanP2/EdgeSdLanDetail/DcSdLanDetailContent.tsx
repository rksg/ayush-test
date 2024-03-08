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

export const DcSdLanDetailContent = (props: { data: EdgeSdLanViewDataP2 | undefined }) => {
  const { data } = props
  const { $t } = useIntl()

  const sdLanInfo = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      content: () =>
        data?.venueId ? (
          <TenantLink to={`/venues/${data.venueId}/venue-details/overview`}>
            {data.venueName}
          </TenantLink>
        ) : (
          noDataDisplay
        )
    },
    {
      title: $t({ defaultMessage: 'Cluster' }),
      content: () =>
        data?.edgeClusterId ? (
          <TenantLink to={`/devices/edge/${data.edgeClusterId}/details/overview`}>
            {data.edgeClusterName}
          </TenantLink>
        ) : (
          noDataDisplay
        )
    },
    {
      title: $t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' }),
      colSpan: 6,
      content: () =>
        data?.tunnelProfileId
          ? (<TenantLink
            to={getPolicyDetailsLink({
              type: PolicyType.TUNNEL_PROFILE,
              oper: PolicyOperation.DETAIL,
              policyId: data.tunnelProfileId!
            })}
          >
            {data.tunnelProfileName}
          </TenantLink>
          ) : (
            noDataDisplay
          )
    }
  ]

  return (
    <SpaceWrapper fullWidth direction='vertical' size={30}>
      <SummaryCard data={sdLanInfo} />
      <Card>
        <SdLanTopologyDiagram
          isGuestTunnelEnabled={false}
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
              { count: data?.networkIds?.length || 0 }
            )}
            key='networks'
          >
            <NetworkTable networkIds={data?.networkIds ?? []} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'SmartEdges({count})' },
              { count: data?.edgeClusterId ? 1 : 0 })}
            key='se'
          >
            <SmartEdgesTable sdLanData={data} />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </SpaceWrapper>
  )
}
