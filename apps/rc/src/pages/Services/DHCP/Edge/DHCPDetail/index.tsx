
import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, Card, Loader, PageHeader, Table, TableProps, SummaryCard }                                                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                        from '@acx-ui/feature-toggle'
import { useGetDhcpStatsQuery, useGetDhcpUeSummaryStatsQuery }                                                                                           from '@acx-ui/rc/services'
import { DhcpUeSummaryStats, ServiceOperation, ServiceType, defaultSort, getServiceDetailsLink, getServiceListRoutePath, getServiceRoutePath, sortProp } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                                                                         from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                                                                                from '@acx-ui/user'

import { EdgeDhcpServiceStatusLight } from '../EdgeDhcpStatusLight'

import * as UI from './styledComponents'

const EdgeDHCPDetail = () => {

  const { $t } = useIntl()
  const params = useParams()

  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const getDhcpStatsPayload = {
    fields: [
      'serviceName',
      'dhcpRelay',
      'dhcpPoolNum',
      'leaseTime'
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
  const { data: dhcpStats, isLoading: isDhcpStatsLoading } = useGetDhcpStatsQuery({
    params,
    payload: getDhcpStatsPayload
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
      key: 'health',
      dataIndex: 'health'
      // render (data, row) {
      //   return <EdgeDhcpServiceStatusLight data={row.health} />
      // }
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
      content: <EdgeDhcpServiceStatusLight
        data={dhcpStats?.data && dhcpStats?.data[0]?.health}
      />
    },
    {
      title: $t({ defaultMessage: 'DHCP Relay' }),
      content: dhcpStats?.data &&
        (dhcpStats?.data[0]?.dhcpRelay === 'true' ?
          $t({ defaultMessage: 'ON' }) :
          $t({ defaultMessage: 'OFF' }))
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      content: dhcpStats?.data && dhcpStats?.data[0]?.dhcpPoolNum
    },
    {
      title: $t({ defaultMessage: 'Lease Time' }),
      content: dhcpStats?.data && (dhcpStats?.data[0]?.leaseTime)
    }
  ]

  return (
    <>
      <PageHeader
        title={dhcpStats && dhcpStats.data[0]?.serviceName}
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
        { isFetching: isDhcpStatsLoading && isDhcpUeSummaryStatsLoading, isLoading: false }
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
