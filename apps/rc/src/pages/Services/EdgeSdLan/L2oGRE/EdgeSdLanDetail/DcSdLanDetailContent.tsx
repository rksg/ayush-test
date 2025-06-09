import { useIntl } from 'react-intl'

import { Card, SummaryCard, Tabs }              from '@acx-ui/components'
import { EdgeServiceStatusLight, SpaceWrapper } from '@acx-ui/rc/components'
import {
  EdgeMvSdLanViewData,
  getPolicyDetailsLink,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { TenantLink }    from '@acx-ui/react-router-dom'
import { noDataDisplay } from '@acx-ui/utils'

import { SdLanApTable }    from './SdLanApTable'
import { SmartEdgesTable } from './SmartEdgesTable'
import * as UI             from './styledComponents'
import { VenueTable }      from './VenueTable'

import { getVenueTableData, useSdlanApListTableQuery } from '.'

export const DcSdLanDetailContent = (props: { data?: EdgeMvSdLanViewData }) => {
  const { data = {} } = props
  const { $t } = useIntl()

  const venueTableData = getVenueTableData(data)
  const venueList = venueTableData.map(v => ({ venueId: v.venueId, venueName: v.venueName }))
  const apListTableQuery = useSdlanApListTableQuery(data)

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
      title: $t({ defaultMessage: 'Tunnel Profile (AP to Cluster)' }),
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
    },
    {
      title: $t({ defaultMessage: 'Destination RUCKUS Edge cluster' }),
      content: () =>
        data?.edgeClusterId ? (
          <TenantLink to={`devices/edge/cluster/${data.edgeClusterId}/edit/cluster-details`}>
            {data.edgeClusterName}
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
        <UI.InstancesContainer>
          <UI.InstancesTitle level={2}>
            {$t({ defaultMessage: 'Instances' })}
          </UI.InstancesTitle>
        </UI.InstancesContainer>
        <Tabs type='third'>
          <Tabs.TabPane
            tab={$t(
              { defaultMessage: '<VenuePlural></VenuePlural> ({count})' },
              { count: venueTableData?.length ?? 0 }
            )}
            key='venues'
          >
            <VenueTable sdLanVenueData={venueTableData} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={$t(
              { defaultMessage: 'AP ({count})' },
              { count: apListTableQuery?.data?.totalCount ?? 0 }
            )}
            key='ap'
          >
            <SdLanApTable
              tableQuery={apListTableQuery}
              venueList={venueList}
              clusterId={data.edgeClusterId ?? ''}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'RUCKUS Edges ({count})' },
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
