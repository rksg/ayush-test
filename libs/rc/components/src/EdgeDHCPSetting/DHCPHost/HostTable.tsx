import { useState } from 'react'

import _                          from 'lodash'
import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { EdgeDhcpHost } from '@acx-ui/rc/utils'

export function HostTable (props:{
  data: EdgeDhcpHost[]
  onAdd?: () => void
  onEdit?: (data?: EdgeDhcpHost) => void
  onDelete?: (data:EdgeDhcpHost[]) => void
  isDefaultService?: Boolean
}) {
  const { $t } = useIntl()
  const { data } = props
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })

  const rowActions: TableProps<EdgeDhcpHost>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: EdgeDhcpHost[]) => {
        if (rows.length === 1) props.onEdit?.(rows[0])
        else showError(true)
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
