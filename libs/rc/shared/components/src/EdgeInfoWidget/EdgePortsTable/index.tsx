import { useIntl } from 'react-intl'

import { Table,TableProps }                      from '@acx-ui/components'
import { formatter }                             from '@acx-ui/formatter'
import { defaultSort, EdgePortStatus, sortProp } from '@acx-ui/rc/utils'

export const EdgePortsTable = ({ data }: { data: EdgePortStatus[] }) => {
  const { $t } = useIntl()

  const columns: TableProps<EdgePortStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Name' }),
      key: 'sortIdx',
      dataIndex: 'sortIdx',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('sortIdx', defaultSort) },
      render: (_, { sortIdx }) => {
        return 'port' + sortIdx
      }
    },
    {
      title: $t({ defaultMessage: 'Description' }),
      key: 'description',
      dataIndex: 'name',
      width: 200,
      sorter: { compare: sortProp('name', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: { compare: sortProp('status', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Admin Status' }),
      key: 'adminStatus',
      dataIndex: 'adminStatus',
      sorter: { compare: sortProp('adminStatus', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Interface MAC' }),
      key: 'mac',
      dataIndex: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: { compare: sortProp('ip', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      sorter: { compare: sortProp('ipMode', defaultSort) },
      render: (_, { ipMode }) => {
        return ipMode === 'DHCP' ? $t({ defaultMessage: 'DHCP' })
          : (ipMode === 'Static' ? $t({ defaultMessage: 'Static IP' }) : '')
      }
    },
    {
      title: $t({ defaultMessage: 'Speed' }),
      key: 'speedKbps',
      dataIndex: 'speedKbps',
      sorter: { compare: sortProp('speedKbps', defaultSort) },
      render: (_, row) => {
        return formatter('networkSpeedFormat')(row.speedKbps)
      }
    }
  ]

  return (
    <Table
      settingsId='edge-ports-table'
      rowKey='portId'
      columns={columns}
      dataSource={data}
    />
  )
}
