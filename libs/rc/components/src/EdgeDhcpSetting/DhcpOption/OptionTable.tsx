import { useIntl } from 'react-intl'

import { Table, TableProps }                     from '@acx-ui/components'
import { EdgeDhcpOption, defaultSort, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess }                        from '@acx-ui/user'

export function OptionTable (props:{
  data: EdgeDhcpOption[]
  openDrawer: (data?: EdgeDhcpOption) => void
  onDelete?: (data:EdgeDhcpOption[]) => void
  isDefaultService?: Boolean
}) {

  const { $t } = useIntl()
  const { data, openDrawer, onDelete } = props

  const rowActions: TableProps<EdgeDhcpOption>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (rows: EdgeDhcpOption[]) => {
        openDrawer(rows[0])
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows: EdgeDhcpOption[], clearSelection) => {
        onDelete?.(rows)
        clearSelection()
      }
    }
  ]

  const columns: TableProps<EdgeDhcpOption>['columns'] = [
    {
      key: 'optionName',
      title: $t({ defaultMessage: 'Option Name' }),
      dataIndex: 'optionName',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('optionName', defaultSort) }
    },
    {
      key: 'optionValue',
      title: $t({ defaultMessage: 'Option Value' }),
      dataIndex: 'optionValue',
      sorter: { compare: sortProp('optionValue', defaultSort) }
    }
  ]

  let actions = [{
    label: $t({ defaultMessage: 'Add Option' }),
    onClick: () => openDrawer()
  }]

  return(
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