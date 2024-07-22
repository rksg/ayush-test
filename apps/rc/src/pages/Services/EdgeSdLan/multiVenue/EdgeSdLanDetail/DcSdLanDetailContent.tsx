import { useIntl } from 'react-intl'

import { Card, SummaryCard, Tabs }                                    from '@acx-ui/components'
import { EdgeServiceStatusLight, SdLanTopologyDiagram, SpaceWrapper } from '@acx-ui/rc/components'
import {
  EdgeMvSdLanViewData,
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

import { SmartEdgesTable } from './SmartEdgesTable'
import * as UI             from './styledComponents'
import { VenueTable }      from './VenueTable'

import { getVenueTableData } from '.'

export const DcSdLanDetailContent = (props: { data?: EdgeMvSdLanViewData }) => {
  const { data = {} } = props
  const { $t } = useIntl()

  const venueTableData = getVenueTableData(data)
  const sdLanInfo = [
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: () => (
        <EdgeServiceStatusLight
          data={data.edgeAlarmSummary ? [data.edgeAlarmSummary] : []}
        />
      )
    },
    {
      title: $t({ defaultMessage: 'Cluster' }),
      content: () =>
        data?.edgeClusterId ? (
          <TenantLink to={`devices/edge/cluster/${data.edgeClusterId}/edit/cluster-details`}>
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
              { defaultMessage: 'Venues({count})' },
              { count: venueTableData?.length ?? 0 }
            )}
            key='venues'
          >
            <VenueTable sdLanVenueData={venueTableData} />
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
