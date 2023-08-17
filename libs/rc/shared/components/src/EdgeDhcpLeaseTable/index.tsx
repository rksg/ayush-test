
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                         from '@acx-ui/components'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { useGetDhcpByEdgeIdQuery, useGetDhcpHostStatsQuery } from '@acx-ui/rc/services'
import { DhcpHostStats, EdgeDhcpHostStatus, useTableQuery }  from '@acx-ui/rc/utils'
import { RequestPayload }                                    from '@acx-ui/types'


interface EdgeDhcpLeaseTableProps {
  edgeId?: string
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
  const hostTableQuery = useTableQuery<DhcpHostStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpHostStatsQuery,
    defaultPayload: getDhcpHostStatsPayload,
    option: { skip: !!!props.edgeId || !isEdgeReady },
    search: {
      searchTargetFields: ['hostName', 'hostIpAddr', 'hostMac']
    }
  })

  const { dhcpPoolOptions } = useGetDhcpByEdgeIdQuery(
    { params: { edgeId: props.edgeId } },
    {
      skip: !!!props.edgeId,
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
    if(days >= 1440 && lessThanADaySec > 0) {
      // rather than 1440 days means infinite
      return $t({ defaultMessage: 'Infinite' })
    }
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
      render: (_, { hostRemainingTime }) => genExpireTimeString(hostRemainingTime)
    }
  ]

  return (
    <Loader states={[hostTableQuery]}>
      <Table
        settingsId='edge-dhcp-leases-table'
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
