import { useIntl } from 'react-intl'

import { Table,TableProps } from '@acx-ui/components'
import { formatter }        from '@acx-ui/formatter'
import { EdgePortStatus }   from '@acx-ui/rc/utils'

export const EdgePortsTable = ({ data }: { data: EdgePortStatus[] }) => {
  const { $t } = useIntl()

  const columns: TableProps<EdgePortStatus>['columns'] = [
    {
      title: $t({ defaultMessage: '#' }),
      key: 'sortIdx',
      dataIndex: 'sortIdx',
      defaultSortOrder: 'ascend',
      render: (id, record, index) => {
        return index + 1
      }
    },
    {
      title: $t({ defaultMessage: 'Port' }),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status'
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus'
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type'
    },
    {
      title: $t({ defaultMessage: 'Interface MAC' }),
      key: 'mac',
      dataIndex: 'mac'
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip'
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speedKbps',
      dataIndex: 'speedKbps',
      render: (data, row) => {
        return formatter('networkSpeedFormat')(row.speedKbps)
      }
    }
  ]

  return (
    <Table
      rowKey='portId'
      columns={columns}
      dataSource={data}
    />
  )
}