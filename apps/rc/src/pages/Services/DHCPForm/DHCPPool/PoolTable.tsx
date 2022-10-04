import { useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { DHCPPool } from '@acx-ui/rc/utils'


export function PoolTable (props:{
  data: DHCPPool[]
  onAdd?: () => void
  onEdit?: (data?: DHCPPool) => void
  onDelete?: (data:DHCPPool[]) => void
  readonly?: Boolean
}) {
  const { $t } = useIntl()
  const { data, readonly=false } = props
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })

  const rowActions: TableProps<DHCPPool>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: DHCPPool[]) => {
        if (rows.length === 1) props.onEdit?.(rows[0])
        else showError(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: DHCPPool[], clearSelection) => {
        props.onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<DHCPPool>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'ip',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ip',
      sorter: true
    },
    {
      key: 'mask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'mask',
      sorter: true
    },
    {
      key: 'leaseTime',
      title: $t({ defaultMessage: 'Lease Time' }),
      dataIndex: 'leaseTime',
      render: (data, row) =>{
        return data + ' ' + row.leaseUnit
      }
    },
    {
      key: 'vlan',
      title: $t({ defaultMessage: 'Vlan' }),
      dataIndex: 'vlan'
    },
    {
      key: 'NumberOfHosts',
      title: $t({ defaultMessage: 'Number of hosts' }),
      dataIndex: 'NumberOfhosts'
    }
  ]
  let actions = readonly ? []: [{
    label: $t({ defaultMessage: 'Add DHCP Pool' }),
    onClick: () => props.onAdd?.()
  }]
  return (
    <>
      {errorVisible && <Alert message={$t(errorMessage)} type='error' showIcon closable />}
      <Table
        rowKey='id'
        columns={columns}
        dataSource={data}
        rowActions={rowActions}
        actions={actions}
        rowSelection={readonly ? undefined : {}}
      />
    </>
  )
}
