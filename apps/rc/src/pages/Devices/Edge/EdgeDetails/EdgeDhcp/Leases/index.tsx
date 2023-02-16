import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { EdgeDhcpLease }             from '@acx-ui/rc/utils'

const useMockData = () => {
  const [data] = useState<EdgeDhcpLease[]>()
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    setIsloading(false)
  }, [])

  return { isLoading, data }
}

const Leases = () => {

  const { $t } = useIntl()
  const { data, isLoading } = useMockData()

  const columns: TableProps<EdgeDhcpLease>['columns'] = [
    {
      title: $t({ defaultMessage: 'Hostname' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'DHCP Pool' }),
      key: 'dhcpPool',
      dataIndex: 'dhcpPool'
    },
    {
      title: $t({ defaultMessage: 'MAC Address' }),
      key: 'mac',
      dataIndex: 'mac'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status'
    },
    {
      title: $t({ defaultMessage: 'Lease expires in...' }),
      key: 'expires',
      dataIndex: 'expires'
    }
  ]

  return (
    <Loader states={[
      { isFetching: isLoading, isLoading: false }
    ]}>
      <Table
        columns={columns}
        dataSource={data}
      />
    </Loader>
  )
}

export default Leases