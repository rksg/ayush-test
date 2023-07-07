import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { ContentSwitcher, ContentSwitcherProps, GridCol, GridRow, Loader, SummaryCard }                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                       from '@acx-ui/feature-toggle'
import { EdgeDhcpLeaseTable, EdgeDhcpPoolTable }                                                        from '@acx-ui/rc/components'
import { useGetDhcpByEdgeIdQuery, useGetDhcpHostStatsQuery, useGetDhcpStatsQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import { EdgeDhcpHostStatus, ServiceOperation, ServiceType, getServiceDetailsLink }                     from '@acx-ui/rc/utils'
import { TenantLink }                                                                                   from '@acx-ui/react-router-dom'

const EdgeDhcpTab = () => {

  const { $t } = useIntl()
  const { venueId } = useParams()
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

  const edgeDataPayload = {
    filters: { venueId: [venueId] }
  }
  const { edgeData, isEdgeLoading } = useGetEdgeListQuery(
    { payload: edgeDataPayload },
    {
      skip: !!!venueId,
      selectFromResult: ({ data, isLoading }) => ({
        edgeData: data?.data[0],
        isEdgeLoading: isLoading
      })
    }
  )
  const { dhcpId, isDhcpLoading } = useGetDhcpByEdgeIdQuery(
    { params: { edgeId: edgeData?.serialNumber } },
    {
      skip: !!!edgeData?.serialNumber,
      selectFromResult: ({ data, isLoading }) => ({
        dhcpId: data?.id,
        isDhcpLoading: isLoading
      })
    }
  )
  const getDhcpStatsPayload = {
    filters: { id: [dhcpId] }
  }
  const { dhcpData, isDhcpStatsLoading } = useGetDhcpStatsQuery(
    { payload: getDhcpStatsPayload },
    {
      skip: !!!dhcpId,
      selectFromResult: ({ data, isLoading }) => ({
        dhcpData: data?.data[0],
        isDhcpStatsLoading: isLoading
      })
    }
  )
  const getDhcpHostStatsPayload = {
    filters: { edgeId: [edgeData?.serialNumber], hostStatus: [EdgeDhcpHostStatus.ONLINE] },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const { data: dhcpHostStats } = useGetDhcpHostStatsQuery({
    payload: getDhcpHostStatsPayload
  }, {
    skip: !isEdgeReady
  })

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Pools ({count})' },
        { count: dhcpData?.dhcpPoolNum || 0 }),
      value: 'pools',
      children: (
        <GridCol col={{ span: 24 }}>
          <EdgeDhcpPoolTable edgeId={edgeData?.serialNumber} />
        </GridCol>
      )
    },
    {
      label: $t({ defaultMessage: 'Leases ({count} online)' },
        { count: dhcpHostStats?.totalCount || 0 }),
      value: 'leases',
      children: (
        <GridCol col={{ span: 24 }}>
          <EdgeDhcpLeaseTable edgeId={edgeData?.serialNumber} />
        </GridCol>
      )
    }
  ]

  const dhcpInfo = [
    {
      title: $t({ defaultMessage: 'Service Name' }),
      content: (
        dhcpData &&
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.DETAIL,
              serviceId: dhcpData?.id!
            })}>
            {dhcpData?.serviceName}
          </TenantLink>
      )
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: ''
    },
    {
      title: $t({ defaultMessage: 'DHCP Relay' }),
      content: (
        dhcpData?.dhcpRelay === 'true' ?
          $t({ defaultMessage: 'ON' }) :
          $t({ defaultMessage: 'OFF' })
      )
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      content: dhcpData?.dhcpPoolNum
    },
    {
      title: $t({ defaultMessage: 'Lease Time' }),
      content: dhcpData?.leaseTime
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: (
        <TenantLink to={`/devices/edge/${edgeData?.serialNumber}/edge-details/overview`}>
          {edgeData?.name}
        </TenantLink>
      )
    }
  ]

  return (
    <Loader states={[{
      isFetching: isDhcpLoading || isEdgeLoading || isDhcpStatsLoading,
      isLoading: false
    }]}>
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <SummaryCard data={dhcpInfo} />
        </GridCol>
        <ContentSwitcher tabDetails={tabDetails} size='large' />
      </GridRow>
    </Loader>
  )
}

export default EdgeDhcpTab