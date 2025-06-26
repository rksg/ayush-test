
import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                         from '@acx-ui/components'
import { useGetDhcpHostStatsQuery }                                          from '@acx-ui/rc/services'
import { DhcpHostStats, DhcpStats, EdgeDhcpHostStatus, genExpireTimeString } from '@acx-ui/rc/utils'
import { useTableQuery }                                                     from '@acx-ui/utils'

interface LeaseTableProps {
  venueId: string
  dhcpStats?: DhcpStats[]
}

export const LeaseTable = (props: LeaseTableProps) => {
  const { venueId, dhcpStats } = props
  const { $t } = useIntl()

  const getDhcpHostStatsPayload = {
    filters: {
      venueId: [venueId]
    }
  }
  const leaseTableQuery = useTableQuery({
    useQuery: useGetDhcpHostStatsQuery,
    defaultPayload: getDhcpHostStatsPayload,
    option: { skip: !venueId },
    search: {
      searchTargetFields: ['hostName', 'hostIpAddr', 'hostMac']
    },
    sorter: {
      sortField: 'hostName',
      sortOrder: 'ASC'
    }
  })

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

  const { dhcpOptions, isInfiniteMap } = useMemo(() => {
    return {
      dhcpOptions: dhcpStats?.map(item => ({
        key: item.id,
        value: item.serviceName
      })),
      isInfiniteMap: dhcpStats?.reduce((acc, item) => {
        acc[item.id] = item.leaseTime === 'Infinite'
        return acc
      }, {} as { [key: string]: boolean })
    }
  }, [dhcpStats])

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
      title: $t({ defaultMessage: 'DHCP Profile' }),
      key: 'dhcpId',
      dataIndex: 'dhcpId',
      filterable: dhcpOptions,
      render: (_, { dhcpId }) => {
        return dhcpOptions?.find(item => item.key === dhcpId)?.value
      }
    },
    {
      title: $t({ defaultMessage: 'DHCP Pool' }),
      key: 'dhcpPoolName',
      dataIndex: 'dhcpPoolName'
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
      render: (_, { hostRemainingTime, dhcpId }) => {
        if(isInfiniteMap?.[dhcpId]) return $t({ defaultMessage: 'Infinite' })
        return genExpireTimeString(hostRemainingTime)
      }
    }
  ]

  return <Loader states={[leaseTableQuery]}>
    <Table
      rowKey='hostMac'
      columns={columns}
      dataSource={leaseTableQuery?.data?.data}
      pagination={leaseTableQuery.pagination}
      onChange={leaseTableQuery.handleTableChange}
      onFilterChange={leaseTableQuery.handleFilterChange}
      enableApiFilter
    />
  </Loader>
}