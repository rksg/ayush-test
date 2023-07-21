import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { defaultSort, EdgeDhcpPool, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess }                      from '@acx-ui/user'

export function PoolTable (props:{
  data: EdgeDhcpPool[]
  openDrawer: (data?: EdgeDhcpPool) => void
  onDelete?: (data:EdgeDhcpPool[]) => void
  openImportModal: (visible: boolean) => void
}) {

  const { $t } = useIntl()
  const { data, openDrawer, onDelete, openImportModal } = props

  const rowActions: TableProps<EdgeDhcpPool>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows: EdgeDhcpPool[]) => {
        openDrawer(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: EdgeDhcpPool[], clearSelection) => {
        onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<EdgeDhcpPool>['columns'] = [
    {
      key: 'poolName',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'poolName',
      sorter: { compare: sortProp('poolName', defaultSort) }
    },
    {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: { compare: sortProp('subnetMask', defaultSort) }
    },
    {
      key: 'poolStartIp',
      title: $t({ defaultMessage: 'Pool Start IP' }),
      dataIndex: 'poolStartIp',
      sorter: { compare: sortProp('poolStartIp', defaultSort) }
    },
    {
      key: 'poolEndIp',
      title: $t({ defaultMessage: 'Pool End IP' }),
      dataIndex: 'poolEndIp',
      sorter: { compare: sortProp('poolEndIp', defaultSort) }
    },
    {
      key: 'gatewayIp',
      title: $t({ defaultMessage: 'Gateway' }),
      dataIndex: 'gatewayIp',
      sorter: { compare: sortProp('gatewayIp', defaultSort) }
    }
  ]

  const actions = [{
    label: $t({ defaultMessage: 'Add DHCP Pool' }),
    onClick: () => openDrawer()
  },{
    label: $t({ defaultMessage: 'Import from file' }),
    onClick: () => openImportModal(true)
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
