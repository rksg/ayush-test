import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { defaultSort, EdgeDhcpHost, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess }                      from '@acx-ui/user'

export function HostTable (props:{
  data: EdgeDhcpHost[]
  openDrawer: (data?: EdgeDhcpHost) => void
  onDelete?: (data:EdgeDhcpHost[]) => void
}) {

  const { $t } = useIntl()
  const { data, openDrawer, onDelete } = props

  const rowActions: TableProps<EdgeDhcpHost>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows: EdgeDhcpHost[]) => {
        openDrawer(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: EdgeDhcpHost[], clearSelection) => {
        onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<EdgeDhcpHost>['columns'] = [
    {
      key: 'hostName',
      title: $t({ defaultMessage: 'Host Name' }),
      dataIndex: 'hostName',
      sorter: { compare: sortProp('hostName', defaultSort) }
    },
    {
      key: 'mac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'mac',
      sorter: { compare: sortProp('mac', defaultSort) }
    },
    {
      key: 'fixedAddress',
      title: $t({ defaultMessage: 'Fixed Address' }),
      dataIndex: 'fixedAddress',
      sorter: { compare: sortProp('fixedAddress', defaultSort) }
    }
  ]

  let actions = [{
    label: $t({ defaultMessage: 'Add Host' }),
    onClick: () => openDrawer()
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
