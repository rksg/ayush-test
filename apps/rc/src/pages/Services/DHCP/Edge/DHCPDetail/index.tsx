
import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, Loader, PageHeader, SummaryCard, Table, TableProps }                                                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                        from '@acx-ui/feature-toggle'
import { EdgeServiceStatusLight }                                                                                                                        from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery, useGetDhcpUeSummaryStatsQuery }                                                                                           from '@acx-ui/rc/services'
import { DhcpUeSummaryStats, ServiceOperation, ServiceType, defaultSort, getServiceDetailsLink, getServiceListRoutePath, getServiceRoutePath, sortProp } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                                                         from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                                                                                from '@acx-ui/user'

import * as UI from './styledComponents'

const EdgeDHCPDetail = () => {

  const { $t } = useIntl()
  const params = useParams()

  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const getDhcpStatsPayload = {
    fields: [
      'id',
      'serviceName',
      'dhcpRelay',
      'dhcpPoolNum',
      'leaseTime',
      'edgeAlarmSummary',
      'edgeNum'
    ],
    filters: { id: [params.serviceId] }
  }
  const getDhcpUeSummaryStatsPayload = {
    fields: [
      'edgeId',
      'edgeName',
      'venueId',
      'venueName',
      'successfulAllocation',
      'remainsIps',
      'droppedPackets'
    ],
    filters: { dhcpId: [params.serviceId] }
  }
  const { dhcpStats, isLoading: isDhcpStatsLoading } = useGetDhcpStatsQuery({
    params,
    payload: getDhcpStatsPayload
  }, {
    selectFromResult: ({ data, isLoading }) => ({
      dhcpStats: data?.data?.[0],
      isLoading
    })
  })
  const { data: dhcpUeSummaryStats, isLoading: isDhcpUeSummaryStatsLoading } =
  useGetDhcpUeSummaryStatsQuery({
    params,
    payload: getDhcpUeSummaryStatsPayload
  },{
    skip: !isEdgeReady
  })

  const columns: TableProps<DhcpUeSummaryStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      key: 'edgeName',
      dataIndex: 'edgeName',
      sorter: { compare: sortProp('edgeName', defaultSort) },
      defaultSortOrder: 'ascend',
      fixed: 'left',
      render: function (data, row) {
        return (
          <TenantLink to={`/devices/edge/${row.edgeId}/details/overview`}>
            {row.edgeName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'venueId',
      dataIndex: 'venueId',
      render: function (data, row) {
        return (
          <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
            {row.venueName}
          </TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Service Health' }),
      key: 'edgeAlarmSummary',
      dataIndex: 'edgeAlarmSummary',
      render: (data, row) => {
        if(!dhcpStats) return '--'
        const targetAlarmSummary = dhcpStats.edgeAlarmSummary?.find(
          item => item.edgeId.toLocaleLowerCase() === row.edgeId?.toLocaleLowerCase()
        )
        return <EdgeServiceStatusLight data={targetAlarmSummary ? [targetAlarmSummary] : []} />
      }
    },
    {
      title: $t({ defaultMessage: '# of successful allocations' }),
      align: 'center',
      key: 'successfulAllocation',
      dataIndex: 'successfulAllocation'
    },
    {
      title: $t({ defaultMessage: '# of remaining IPs' }),
      align: 'center',
      key: 'remainsIps',
      dataIndex: 'remainsIps'
    },
    {
      title: $t({ defaultMessage: '# of packets' }),
      align: 'center',
      key: 'droppedPackets',
      dataIndex: 'droppedPackets',
      render (data, row) {
        return `${row.droppedPackets}`
      }
    }
  ]

  // const rowActions: TableProps<DhcpStats>['rowActions'] = [
  //   {
  //     label: $t({ defaultMessage: 'Restart' }),
  //     onClick: (selectedRows, clearSelection) => {
  //       // TODO API not ready
  //       clearSelection()
  //     }
  //   }
  // ]

  const dhcpInfo = [
    {
      title: $t({ defaultMessage: 'Service Health' }),
      content: dhcpStats &&
      (dhcpStats.edgeNum ?? 0) ?
        <EdgeServiceStatusLight data={dhcpStats?.edgeAlarmSummary} /> :
        '--'
    },
    {
      title: $t({ defaultMessage: 'DHCP Relay' }),
      content: dhcpStats &&
        (dhcpStats?.dhcpRelay === 'true' ?
          $t({ defaultMessage: 'ON' }) :
          $t({ defaultMessage: 'OFF' }))
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      content: dhcpStats && dhcpStats?.dhcpPoolNum
    },
    {
      title: $t({ defaultMessage: 'Lease Time' }),
      content: dhcpStats && (dhcpStats?.leaseTime)
    }
  ]

  return (
    <>
      <PageHeader
        title={dhcpStats && dhcpStats?.serviceName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'DHCP for SmartEdge' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          // eslint-disable-next-line max-len
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.EDGE_DHCP,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        { isFetching: isDhcpStatsLoading || isDhcpUeSummaryStatsLoading, isLoading: false }
      ]}>
        <Space direction='vertical' size={30}>
          <SummaryCard data={dhcpInfo} />
          <Card>
            <UI.InstancesMargin>
              <Typography.Title level={2}>
                {$t({ defaultMessage: 'Instances ({count})' },
                  { count: dhcpUeSummaryStats?.totalCount || 0 })}
              </Typography.Title>
              <Table
                columns={columns}
                dataSource={dhcpUeSummaryStats?.data}
                rowKey='edgeId'
              />
            </UI.InstancesMargin>
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default EdgeDHCPDetail
