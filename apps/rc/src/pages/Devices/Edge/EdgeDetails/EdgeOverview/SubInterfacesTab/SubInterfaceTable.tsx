import { useIntl } from 'react-intl'

import { Table, TableProps }                     from '@acx-ui/components'
import { EdgePortInfo, getEdgePortIpModeString } from '@acx-ui/rc/utils'
import { RequestPayload }                        from '@acx-ui/types'
import { TableQuery }                            from '@acx-ui/utils'

interface SubInterfaceTableProps {
  settingsId?: string
  tableQuery: TableQuery<EdgePortInfo, RequestPayload<unknown>, unknown>
}

export const SubInterfaceTable = (props: SubInterfaceTableProps) => {

  const { tableQuery, settingsId = 'edge-sub-interfaces-table' } = props
  const { $t } = useIntl()

  const columns: TableProps<EdgePortInfo>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'portType',
      dataIndex: 'portType',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'IP Address' }),
      key: 'ip',
      dataIndex: 'ip',
      sorter: true,
      render: (_, row) => {
        // remove the subnet mask in ip if exists
        return row.ip?.replace(/\/\d*/, '')
      }
    },
    {
      title: $t({ defaultMessage: 'IP Type' }),
      key: 'ipMode',
      dataIndex: 'ipMode',
      sorter: true,
      render: (_, { ipMode }) => {
        const ipModeUpperCase = ipMode.toUpperCase()
        return getEdgePortIpModeString($t, ipModeUpperCase)
      }
    },
    {
      title: $t({ defaultMessage: 'Subnet Mask' }),
      key: 'subnet',
      dataIndex: 'subnet',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'VLAN' }),
      key: 'vlan',
      dataIndex: 'vlan',
      sorter: true
    }
  ]

  return (
    <Table
      settingsId={settingsId}
      rowKey={(row: EdgePortInfo) => `${row.mac}-${row.vlan}`}
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
    />
  )
}