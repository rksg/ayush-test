
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                                  from '@acx-ui/components'
import { useGetDhcpHostStatsQuery, useGetDhcpStatsQuery, useGetEdgeDhcpServiceQuery } from '@acx-ui/rc/services'
import { DhcpHostStats, EdgeDhcpHostStatus, genExpireTimeString, useTableQuery }      from '@acx-ui/rc/utils'
import { RequestPayload }                                                             from '@acx-ui/types'

interface EdgeDhcpLeaseTableProps {
  isInfinite?: boolean
  clusterId?: string
}

export const EdgeDhcpLeaseTable = (props: EdgeDhcpLeaseTableProps) => {

  const { clusterId } = props
  const { $t } = useIntl()

  const getDhcpHostStatsPayload = {
    filters: { edgeClusterId: [clusterId] },
    sortField: 'hostName',
    sortOrder: 'ASC',
    searchTargetFields: ['hostName', 'hostIpAddr', 'hostMac']
  }
  const settingsId = 'edge-dhcp-leases-table'
  const hostTableQuery = useTableQuery<DhcpHostStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpHostStatsQuery,
    defaultPayload: getDhcpHostStatsPayload,
    option: { skip: !!!clusterId },
    search: {
      searchTargetFields: ['hostName', 'hostIpAddr', 'hostMac']
    },
    pagination: { settingsId }
  })

  const { dhcpId } = useGetDhcpStatsQuery(
    {
      payload: {
        fields: [
          'id'
        ],
        filters: { edgeClusterIds: [clusterId] }
      }
    },
    {
      skip: !Boolean(clusterId),
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
