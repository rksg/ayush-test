import { useState } from 'react'

import _                          from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
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
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })

  const rowActions: TableProps<EdgeDhcpPool>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: EdgeDhcpPool[]) => {
        if (rows.length === 1) props.onEdit?.(rows[0])
        else showError(true)
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
      key: 'name',
      title: $t({ defaultMessage: 'Pool Name' }),
      dataIndex: 'name',
      sorter: true
    },
    {
      key: 'subnetMask',
      title: $t({ defaultMessage: 'Subnet Mask' }),
      dataIndex: 'subnetMask',
      sorter: true
    },
    {
      key: 'poolRange',
      title: $t({ defaultMessage: 'Pool Range' }),
      dataIndex: 'poolRange',
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
    <>
      {errorVisible && <Alert message={$t(errorMessage)} type='error' showIcon closable />}
      <Table
        rowKey='id'
        columns={columns}
        dataSource={data}
        rowActions={rowActions}
        actions={actions}
        rowSelection={{}}
      />
    </>
  )
}
