import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import { EdgeDhcpPool } from '@acx-ui/rc/utils'

export function PoolTable (props:{
  data: EdgeDhcpPool[]
  onAdd?: () => void
  onEdit?: (data?: EdgeDhcpPool) => void
  onDelete?: (data:EdgeDhcpPool[]) => void
  isDefaultService?: Boolean
}) {
  const { $t } = useIntl()
  const { data } = props

  const rowActions: TableProps<EdgeDhcpPool>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows: EdgeDhcpPool[]) => {
        props.onEdit?.(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: EdgeDhcpPool[], clearSelection) => {
        props.onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<EdgeDhcpPool>['columns'] = [
    {
      key: 'poolName',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'poolName',
      sorter: true
    },
    {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: true
    },
    {
      key: 'poolStartIp',
      title: $t({ defaultMessage: 'Pool Start IP' }),
      dataIndex: 'poolStartIp',
      sorter: true
    },
    {
      key: 'poolEndIp',
      title: $t({ defaultMessage: 'Pool End IP' }),
      dataIndex: 'poolEndIp',
      sorter: true
    },
    {
      key: 'gatewayIp',
      title: $t({ defaultMessage: 'Gateway' }),
      dataIndex: 'gatewayIp',
      sorter: true
    }
  ]
  let actions = [{
    label: $t({ defaultMessage: 'Add DHCP Pool' }),
    onClick: () => props.onAdd?.()
  }]
  return (
    <Table
      rowKey='id'
      columns={columns}
      dataSource={data}
      rowActions={rowActions}
      actions={actions}
      rowSelection={{}}
    />
  )
}
