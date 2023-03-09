import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { EdgeDhcpHost }   from '@acx-ui/rc/utils'
import { filterByAccess } from '@acx-ui/user'

export function HostTable (props:{
  data: EdgeDhcpHost[]
  openDrawer: (data?: EdgeDhcpHost) => void
  onDelete?: (data:EdgeDhcpHost[]) => void
  isDefaultService?: Boolean
}) {
  const { $t } = useIntl()
  const { data } = props

  const rowActions: TableProps<EdgeDhcpHost>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows: EdgeDhcpHost[]) => {
        props.openDrawer(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: EdgeDhcpHost[], clearSelection) => {
        props.onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<EdgeDhcpHost>['columns'] = [
    {
      key: 'hostName',
      title: $t({ defaultMessage: 'Host Name' }),
      dataIndex: 'hostName',
      sorter: true
    },
    {
      key: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      sorter: true
    },
    {
      key: 'fixedAddress',
      title: $t({ defaultMessage: 'Fixed Address' }),
      dataIndex: 'fixedAddress',
      sorter: true
    }
  ]
  let actions = [{
    label: $t({ defaultMessage: 'Add Host' }),
    onClick: () => props.openDrawer()
  }]
  return (
    <Table
      rowKey='id'
      columns={columns}
      dataSource={data}
      rowActions={filterByAccess(rowActions)}
      actions={filterByAccess(actions)}
      rowSelection={{}}
    />
  )
}
