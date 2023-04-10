
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                        from '@acx-ui/components'
import { useGetDhcpByEdgeIdQuery, useGetDhcpHostStatsQuery }                from '@acx-ui/rc/services'
import { DhcpHostStats, EdgeDhcpHostStatus, RequestPayload, useTableQuery } from '@acx-ui/rc/utils'

interface EdgeDhcpLeaseTableProps {
  edgeId?: string
}

export const EdgeDhcpLeaseTable = (props: EdgeDhcpLeaseTableProps) => {

  const { $t } = useIntl()

  const getDhcpHostStatsPayload = {
    filters: { edgeId: [props.edgeId] },
    sortField: 'name',
    sortOrder: 'ASC'
  }
  const hostTableQuery = useTableQuery<DhcpHostStats, RequestPayload<unknown>, unknown>({
    useQuery: useGetDhcpHostStatsQuery,
    defaultPayload: getDhcpHostStatsPayload,
    option: { skip: !!!props.edgeId }
  })

  const { dhcpPoolOptions } = useGetDhcpByEdgeIdQuery(
    { params: { edgeId: props.edgeId } },
    {
      skip: !!!props.edgeId,
      selectFromResult: ({ data }) => ({
        dhcpPoolOptions: data?.dhcpPools.map(pool => ({
          key: pool.poolName,
          value: pool.poolName
        }))
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
      render: (data) => {
        return data === EdgeDhcpHostStatus.ONLINE ?
          $t({ defaultMessage: 'Online' }) :
          $t({ defaultMessage: 'Offline' })
      }
    },
    {
      title: $t({ defaultMessage: 'Lease expires in...' }),
      key: 'hostExpireDate',
      dataIndex: 'hostExpireDate'
    }
  ]

  return (
    <Loader states={[hostTableQuery]}>
      <Table
        settingsId='edge-dhcp-leases-table'
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
