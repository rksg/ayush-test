import { useEffect, useState } from 'react'

import { Progress, Switch } from 'antd'
import { useIntl }          from 'react-intl'

import { Loader, Table, TableProps } from '@acx-ui/components'
import { EdgeDhcpPool }              from '@acx-ui/rc/utils'

export const useMockData = () => {
  const [data, setData] = useState<EdgeDhcpPool[]>()
  const [isLoading, setIsloading] = useState(true)

  useEffect(() => {
    setData([
      {
        name: 'Pool1',
        subnetAddress: '1.1.1.1',
        subnetMask: '255.255.255.0',
        range: '1.1.1.1 - 1.1.1.99',
        gateway: '1.1.1.1',
        utilization: 25,
        activate: true
      },
      {
        name: 'Pool2',
        subnetAddress: '2.2.2.2',
        subnetMask: '255.255.255.0',
        range: '2.2.2.1 - 2.2.2.99',
        gateway: '2.2.2.2',
        utilization: 25,
        activate: false
      }
    ])
    setIsloading(false)
  }, [])

  return { isLoading, data }
}

const Pools = () => {

  const { $t } = useIntl()
  const { data, isLoading } = useMockData()

  const columns: TableProps<EdgeDhcpPool>['columns'] = [
    {
      title: $t({ defaultMessage: 'Pool' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Subnet Address' }),
      key: 'subnetAddress',
      dataIndex: 'subnetAddress'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnetMask',
      dataIndex: 'subnetMask'
    },
    {
      title: $t({ defaultMessage: 'Pool Range' }),
      key: 'range',
      dataIndex: 'range'
    },
    {
      title: $t({ defaultMessage: 'Gateway' }),
      key: 'gateway',
      dataIndex: 'gateway'
    },
    {
      title: $t({ defaultMessage: 'Utilization' }),
      key: 'utilization',
      dataIndex: 'utilization',
      render (data, row) {
        return <Progress
          style={{ width: 100 }}
          strokeLinecap='butt'
          strokeColor='var(--acx-semantics-green-50)'
          percent={row.utilization}
          showInfo={false}
          strokeWidth={20}
        />
      }
    },
    {
      title: $t({ defaultMessage: 'Activate' }),
      key: 'activate',
      dataIndex: 'activate',
      render (data, row) {
        return <Switch defaultChecked={row.activate} />
      }
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

export default Pools