
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                                                              from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                 from '@acx-ui/feature-toggle'
import { useEdgeBySerialNumberQuery, useGetDhcpHostStatsQuery, useGetDhcpStatsQuery, useGetEdgeDhcpServiceQuery } from '@acx-ui/rc/services'
import { DhcpHostStats, EdgeDhcpHostStatus, useTableQuery }                                                       from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                         from '@acx-ui/types'


interface EdgeDhcpLeaseTableProps {
  edgeId?: string
  isInfinite?: boolean
  clusterId?: string
}

export const EdgeDhcpLeaseTable = (props: EdgeDhcpLeaseTableProps) => {

  const { $t } = useIntl()
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

  const getDhcpHostStatsPayload = {
    filters: { edgeId: [props.edgeId] },
    sortField: 'hostName',
    sortOrder: 'ASC',
    searchTargetFields: ['hostName', 'hostIpAddr', 'hostMac']
  }
  const settingsId = 'edge-dhcp-leases-table'
  const hostTableQuery = useTableQuery<DhcpHostStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpHostStatsQuery,
    defaultPayload: getDhcpHostStatsPayload,
    option: { skip: !!!props.edgeId || !isEdgeReady },
    search: {
      searchTargetFields: ['hostName', 'hostIpAddr', 'hostMac']
    },
    pagination: { settingsId }
  })

  const { data: currentEdgeStatus } = useEdgeBySerialNumberQuery({
    payload: {
      fields: [
        'clusterId'
      ],
      filters: { serialNumber: [props.edgeId] } }
  }, { skip: Boolean(props.clusterId) })

  const { dhcpId } = useGetDhcpStatsQuery(
    {
      payload: {
        fields: [
          'id'
        ],
        filters: { edgeClusterIds: [(props.clusterId || currentEdgeStatus?.clusterId)] }
      }
    },
    {
      skip: !Boolean(props.clusterId) && !Boolean(currentEdgeStatus?.clusterId),
      selectFromResult: ({ data }) => ({
        dhcpId: data?.data[0]?.id
      })
    }
  )

  const { dhcpPoolOptions } = useGetEdgeDhcpServiceQuery(
    { params: { id: dhcpId } },
    {
      skip: !Boolean(dhcpId),
      selectFromResult: ({ data }) => ({
        dhcpPoolOptions: data?.dhcpPools?.map(pool => ({
          key: pool.poolName,
          value: pool.poolName
        })) ?? []
      })
    }
  )

  const genExpireTimeString = (seconds?: number) => {
    const days = seconds && seconds > 0 ? Math.floor(seconds/86400) : 0
    const lessThanADaySec = seconds && seconds > 0 ? Math.floor(seconds%86400) : 0
    return $t(
      { defaultMessage: '{days, plural, =0 {} one {# Day} other {# Days}} {time}' },
      {
        days,
        time: new Date(lessThanADaySec * 1000).toISOString().slice(11, 19)
      }
    )
  }

  const statusOptions = [
    {
      key: EdgeDhcpHostStatus.ONLINE,
      value: $t({ defaultMessage: 'Online' })
    },
    {
      key: EdgeDhcpHostStatus.OFFLINE,
      value: $t({ defaultMessage: 'Offline' })
    }
  ]

  const columns: TableProps<DhcpHostStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hostname' }),
      key: 'hostName',
      dataIndex: 'hostName',
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'hostIpAddr',
      dataIndex: 'hostIpAddr',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'DHCP Pool' }),
      key: 'dhcpPoolName',
      dataIndex: 'dhcpPoolName',
      filterable: dhcpPoolOptions
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'hostMac',
      dataIndex: 'hostMac',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'hostStatus',
      dataIndex: 'hostStatus',
      filterable: statusOptions,
      render: (_, { hostStatus }) => {
        return hostStatus === EdgeDhcpHostStatus.ONLINE ?
          $t({ defaultMessage: 'Online' }) :
          $t({ defaultMessage: 'Offline' })
      }
    },
    {
      title: $t({ defaultMessage: 'Lease expires in...' }),
      key: 'hostRemainingTime',
      dataIndex: 'hostRemainingTime',
      render: (_, { hostRemainingTime }) => {
        if(props.isInfinite) return $t({ defaultMessage: 'Infinite' })
        return genExpireTimeString(hostRemainingTime)
      }
    }
  ]

  return (
    <Loader states={[hostTableQuery]}>
      <Table
        settingsId={settingsId}
        rowKey='hostMac'
        columns={columns}
        dataSource={hostTableQuery?.data?.data}
        pagination={hostTableQuery.pagination}
        onChange={hostTableQuery.handleTableChange}
        onFilterChange={hostTableQuery.handleFilterChange}
        enableApiFilter
      />
    </Loader>
  )
}
