import { useIntl } from 'react-intl'

import { Table, TableProps }                                                  from '@acx-ui/components'
import { EdgeLagStatus, EdgePortStatus, getEdgePortIpModeString, TableQuery } from '@acx-ui/rc/utils'
import { RequestPayload }                                                     from '@acx-ui/types'

interface SubInterfaceTableProps {
  tableQuery: TableQuery<EdgePortStatus | EdgeLagStatus, RequestPayload<unknown>, unknown>
}

export const SubInterfaceTable = (props: SubInterfaceTableProps) => {

  const { tableQuery } = props
  const { $t } = useIntl()

  const columns: TableProps<EdgePortStatus | EdgeLagStatus>['columns'] = [
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: true,
      render: (_, row) => {
        return 'type' in row ? row.type : row.portType
      }
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
      settingsId='edge-sub-interfaces-table'
      rowKey={(row: EdgePortStatus | EdgeLagStatus) => `${row.mac}-${row.vlan}`}
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
    />
  )
}