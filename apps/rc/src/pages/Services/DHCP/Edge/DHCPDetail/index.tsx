
import { useMemo } from 'react'

import { Col, Row, Space, Typography } from 'antd'
import { useIntl }                     from 'react-intl'

import { Button, Card, Loader, PageHeader, SummaryCard, Table, TableProps }                                    from '@acx-ui/components'
import { EdgeServiceStatusLight, useIsEdgeReady }                                                              from '@acx-ui/rc/components'
import { useGetDhcpStatsQuery, useGetDhcpUeSummaryStatsQuery, useGetEdgeClusterListQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import {
  DhcpUeSummaryStats,
  ServiceOperation,
  ServiceType,
  defaultSort,
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  getServiceAllowedOperation,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  sortProp
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { noDataDisplay }         from '@acx-ui/utils'

import { CompatibilityCheck } from './CompatibilityCheck'
import * as UI                from './styledComponents'

interface EdgeTableType extends DhcpUeSummaryStats {
  edgeClusterName?: string
  venueName?: string
}

const EdgeDHCPDetail = () => {

  const { $t } = useIntl()
  const params = useParams()
  const isEdgeReady = useIsEdgeReady()

  const getDhcpStatsPayload = {
    fields: [
      'id',
      'serviceName',
      'dhcpRelay',
      'dhcpPoolNum',
      'leaseTime',
      'edgeAlarmSummary',
      'edgeClusterIds'
    ],
    filters: { id: [params.serviceId] }
  }
  const getDhcpUeSummaryStatsPayload = {
    fields: [
      'edgeClusterId',
      'venueId',
      'successfulAllocation',
      'remainsIps',
      'droppedPackets'
    ],
    pageSize: 10000,
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
  const { clusterNameMap, edgeNodeMap, isEdgeClusterInfoLoading } = useGetEdgeClusterListQuery({
    payload: {
      fields: ['clusterId', 'name', 'edgeList'],
      filters: { clusterId: dhcpUeSummaryStats?.data.map(
        summaryStats =>summaryStats.edgeClusterId
      ) }
    }
  }, {
    skip: !dhcpUeSummaryStats?.data?.length,
    selectFromResult: ({ data, isLoading }) => ({
      clusterNameMap: data?.data?.reduce((acc, curr) =>{
        acc[curr.clusterId ?? ''] = curr.name ?? ''
        return acc
      }, {} as { [key: string]: string }),
      edgeNodeMap: data?.data?.reduce((acc, curr) =>{
        acc[curr.clusterId ?? ''] = curr.edgeList?.map(item =>
          item.serialNumber.toUpperCase()) ?? []
        return acc
      }, {} as { [key: string]: string[] }),
      isEdgeClusterInfoLoading: isLoading
    })
  })
  const { venueNameMap, isVenueInfoLoading } = useVenuesListQuery({
    payload: {
      fields: ['id', 'name'],
      filters: { id: dhcpUeSummaryStats?.data.map(
        summaryStats =>summaryStats.venueId
      ) }
    }
  }, {
    skip: !dhcpUeSummaryStats?.data?.length,
    selectFromResult: ({ data, isLoading }) => ({
      venueNameMap: data?.data?.reduce((acc, curr) =>{
        acc[curr.id] = curr.name
        return acc
      }, {} as { [key: string]: string }),
      isVenueInfoLoading: isLoading
    })
  })

  const tableData = useMemo(() => {
    return dhcpUeSummaryStats?.data.map(item => ({
      ...item,
      edgeClusterName: clusterNameMap?.[item.edgeClusterId ?? ''],
      venueName: venueNameMap?.[item.venueId ?? '']
    }))
  }, [dhcpUeSummaryStats, clusterNameMap, venueNameMap])

  const columns: TableProps<EdgeTableType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Cluster' }),
      key: 'edgeClusterName',
      dataIndex: 'edgeClusterName',
      sorter: { compare: sortProp('edgeClusterName', defaultSort) },
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueId',
      dataIndex: 'venueId',
      render: function (_, row) {
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
        if(!dhcpStats) return noDataDisplay
        const targetAlarmSummary = dhcpStats.edgeAlarmSummary?.filter(
          item => edgeNodeMap?.[row.edgeClusterId ?? '']?.includes(item.edgeId.toUpperCase())
        )
        return <EdgeServiceStatusLight data={targetAlarmSummary ?? []} />
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
      (dhcpStats?.edgeClusterIds?.length ?? 0) ?
        <EdgeServiceStatusLight data={dhcpStats?.edgeAlarmSummary} /> :
        noDataDisplay
    },
    {
      title: $t({ defaultMessage: 'DHCP Relay' }),
      content: dhcpStats?.dhcpRelay === 'true' ?
        $t({ defaultMessage: 'ON' }) :
        $t({ defaultMessage: 'OFF' })
    },
    {
      title: $t({ defaultMessage: 'DHCP Pools' }),
      content: dhcpStats?.dhcpPoolNum ?? 0
    },
    {
      title: $t({ defaultMessage: 'Lease Time' }),
      content: dhcpStats?.leaseTime || noDataDisplay
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
            text: $t({ defaultMessage: 'DHCP for RUCKUS Edge' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccessForServicePolicyMutation([
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.EDGE_DHCP,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId!
            })}
            scopeKey={getScopeKeyByService(ServiceType.EDGE_DHCP, ServiceOperation.EDIT)}
            rbacOpsIds={getServiceAllowedOperation(ServiceType.EDGE_DHCP, ServiceOperation.EDIT)}
          >
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[
        { isFetching: isDhcpStatsLoading || isDhcpUeSummaryStatsLoading ||
            isEdgeClusterInfoLoading || isVenueInfoLoading, isLoading: false }
      ]}>
        {
          !!params.serviceId &&
          <Row>
            <Col span={24}>
              <CompatibilityCheck serviceId={params.serviceId} />
            </Col>
          </Row>
        }
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
                dataSource={tableData}
                rowKey='edgeClusterId'
              />
            </UI.InstancesMargin>
          </Card>
        </Space>
      </Loader>
    </>
  )
}

export default EdgeDHCPDetail
