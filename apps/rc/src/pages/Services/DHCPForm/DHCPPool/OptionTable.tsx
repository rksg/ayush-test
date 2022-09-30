import { useState } from 'react'

import { useIntl, defineMessage } from 'react-intl'

import {
  Alert,
  Table,
  TableProps
} from '@acx-ui/components'
import { DHCPOption } from '@acx-ui/rc/utils'

export function OptionTable (props:{
  data: DHCPOption[]
  onAdd?: () => void
  onEdit?: (data: DHCPOption) => void
  onDelete?: (data: DHCPOption[]) => void
}) {
  const { $t } = useIntl()
  const { data } = props
  const [ errorVisible, showError ] = useState<Boolean>(false)
  const errorMessage = defineMessage({
    defaultMessage: 'Only one record can be selected for editing!'
  })
  const rowActions: TableProps<DHCPOption>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (rows: DHCPOption[]) => {
        if (rows.length === 1) props.onEdit?.(rows[0])
        else showError(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: DHCPOption[], clearSelection) => {
        clearSelection()
        props.onDelete?.(rows)
      }
    }
  ]

  const columns: TableProps<DHCPOption>['columns'] = [
    {
      key: 'optId',
      title: $t({ defaultMessage: 'Option ID' }),
      dataIndex: 'optId',
      sorter: true
    },
    {
      key: 'optName',
      title: $t({ defaultMessage: 'Option Name' }),
      dataIndex: 'optName',
      sorter: true
    },
    {
      key: 'format',
      title: $t({ defaultMessage: 'Option Format' }),
      dataIndex: 'format',
      sorter: true
    },
    {
      key: 'value',
      title: $t({ defaultMessage: 'Option Value' }),
      dataIndex: 'value'
    }
  ]
  return (
    <>
      {errorVisible && <Alert message={$t(errorMessage)} type='error' showIcon closable />}
      <Table
        rowKey='id'
        columns={columns}
        dataSource={data}
        rowActions={rowActions}
        actions={[{
          label: $t({ defaultMessage: 'Add option' }),
          onClick: () => props.onAdd?.()
        }]}
        rowSelection={{}}
      />
    </>
  )
}
