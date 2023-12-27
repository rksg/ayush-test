import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Card, Loader, PageHeader, SummaryCard } from '@acx-ui/components'
import { useGetEdgeSdLanViewDataListQuery }              from '@acx-ui/rc/services'
import {
  EdgeSdLanViewData,
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  getPolicyDetailsLink,
  PolicyType,
  PolicyOperation
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'
import { noDataDisplay }         from '@acx-ui/utils'

import { NetworkTable } from './NetworkTable'
import * as UI          from './styledComponents'

const EdgeSdLanDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { edgeSdLanData, isLoading } = useGetEdgeSdLanViewDataListQuery(
    { payload: {
      filters: { id: [params.serviceId] }
    } },
    {
      selectFromResult: ({ data, isLoading }) => ({
        edgeSdLanData: data?.data?.[0] || {} as EdgeSdLanViewData,
        isLoading
      })
    }
  )

  const sdLanInfo = [{
    title: $t({ defaultMessage: 'Venue' }),
    content: () => ((edgeSdLanData.venueId)
      ? <TenantLink to={`/venues/${edgeSdLanData.venueId}/venue-details/overview`}>
        {edgeSdLanData.venueName}
      </TenantLink>
      : noDataDisplay
    )
  }, {
    title: $t({ defaultMessage: 'SmartEdge' }),
    content: () => ((edgeSdLanData.edgeId)
      ? <TenantLink to={`/devices/edge/${edgeSdLanData.edgeId}/details/overview`}>
        {edgeSdLanData.edgeName}
      </TenantLink>
      : noDataDisplay
    )
  }, {
    title: $t({ defaultMessage: 'Tunnel Profile' }),
    content: () => ((edgeSdLanData.tunnelProfileId)
      ? <TenantLink to={getPolicyDetailsLink({
        type: PolicyType.TUNNEL_PROFILE,
        oper: PolicyOperation.DETAIL,
        policyId: edgeSdLanData.tunnelProfileId!
      })}>
        {edgeSdLanData.tunnelProfileName}
      </TenantLink>
      : noDataDisplay
    )
  }]

  return (
    <>
      <PageHeader
        title={edgeSdLanData.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'SD-LAN' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_SD_LAN,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.EDGE_SD_LAN,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[{
        isFetching: isLoading,
        isLoading: false
      }]}>
        <Space direction='vertical' size={30}>
          <SummaryCard data={sdLanInfo} />
          <Card>
            <UI.InstancesContainer>
              <UI.InstancesTitle level={2}>
                {$t(
                  { defaultMessage: 'Instances ({count})' },
                  { count: edgeSdLanData.networkIds?.length || 0 }
                )}
              </UI.InstancesTitle>
              {/*   // TODO: hide this temporarily and wait for furthur enhancement
              <Space size={10}>
                <Typography.Text>
                  {$t(
                    { defaultMessage: 'Total Tunnels: {totalTunnels}' },
                    { totalTunnels: edgeSdLanData.vxlanTunnelNum || 0 }
                  )}
                </Typography.Text>
                <Typography.Text>
                  |
                </Typography.Text>
                <Typography.Text>
                  {$t(
                    { defaultMessage: 'Total VLANs: {totalVlans}' },
                    { totalVlans: edgeSdLanData.vlanNum || 0 }
                  )}
                </Typography.Text>
              </Space>
              */}
            </UI.InstancesContainer>
            <NetworkTable networkIds={edgeSdLanData.networkIds || []} />
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default EdgeSdLanDetail
