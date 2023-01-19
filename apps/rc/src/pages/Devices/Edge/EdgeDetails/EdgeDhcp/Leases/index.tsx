import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { EdgeDhcpLease }             from '@acx-ui/rc/utils'

const useMockData = () => {
  const [data, setData] = useState<EdgeDhcpLease[]>()
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    setData([
      {
        name: 'Host1',
        ip: '1.1.1.1',
        dhcpPool: 'Pool1',
        mac: '90:83:93:a1:78:48',
        status: 'Online',
        expires: '10:28:10'
      },
      {
        name: 'Host2',
        ip: '2.2.2.2',
        dhcpPool: 'Pool2',
        mac: 'ac:3c:0b:65:46:e7',
        status: 'Online',
        expires: '22:46:10'
      }
    ])
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