
import { Progress } from 'antd'
import { useIntl }  from 'react-intl'

import { Loader, Table, TableProps }                 from '@acx-ui/components'
import { DhcpPoolStats, RequestPayload, TableQuery } from '@acx-ui/rc/utils'

interface PoolsProps {
  tableQuery: TableQuery<DhcpPoolStats, RequestPayload<unknown>, unknown>
}

const Pools = ({ tableQuery }: PoolsProps) => {

  const { $t } = useIntl()

  const columns: TableProps<DhcpPoolStats>['columns'] = [
    {
      title: $t({ defaultMessage: 'Pool' }),
      key: 'poolName',
      dataIndex: 'poolName',
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnetMask',
      dataIndex: 'subnetMask'
    },
    {
      title: $t({ defaultMessage: 'Pool Range' }),
      key: 'poolRange',
      dataIndex: 'poolRange'
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
      render () {
        return <Progress
          style={{ width: 100 }}
          strokeLinecap='butt'
          strokeColor='var(--acx-semantics-green-50)'
          percent={0}
          showInfo={false}
          strokeWidth={20}
        />
      }
    }
    // TODO Activate TBD
    // {
    //   title: $t({ defaultMessage: 'Activate' }),
    //   key: 'activate',
    //   dataIndex: 'activate',
    //   render (data, row) {
    //     return <Switch defaultChecked={row.activate} />
    //   }
    // }
  ]

  return (
    <Loader states={[tableQuery]}>
      <Table
        columns={columns}
        dataSource={tableQuery?.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Loader>
  )
}

export default Pools