import { useIntl } from 'react-intl'

import { Loader, Table,TableProps }               from '@acx-ui/components'
import { useGetEdgeSubInterfacesStatusListQuery } from '@acx-ui/rc/services'
import { EdgePortStatus, useTableQuery }          from '@acx-ui/rc/utils'

export const EdgeSubInterfacesTable = ({ serialNumber, portMac }:
   { serialNumber: string, portMac: string }) => {
  const { $t } = useIntl()

  const defaultPayload = {
    fields: [
      'sortIdx', 'mac', 'name', 'type', 'status', 'ip', 'subnet', 'vlan', 'serialNumber'
    ],
    filters: { serialNumber: [serialNumber], mac: [portMac] },
    sortField: 'sortIdx',
    sortOrder: 'ASC'
  }

  const tableQuery = useTableQuery({
    useQuery: useGetEdgeSubInterfacesStatusListQuery,
    defaultPayload: defaultPayload,
    sorter: {
      sortField: 'sortIdx',
      sortOrder: 'ASC'
    }
  })

  const columns: TableProps<EdgePortStatus>['columns'] = [
    {
      key: 'sortIdx',
      dataIndex: 'sortIdx',
      defaultSortOrder: 'ascend',
      show: false
    },
    {
      title: $t({ defaultMessage: 'Port Type' }),
      key: 'type',
      dataIndex: 'type',
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
        return row.ip.replace(/\/\d*/, '')
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
    <Loader states={[tableQuery]}>
      <Table
        settingsId='edge-sub-interfaces-table'
        rowKey={(row: EdgePortStatus) => `${row.mac}-${row.vlan}`}
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
      />
    </Loader>
  )
}