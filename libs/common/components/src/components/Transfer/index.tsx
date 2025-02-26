import React from 'react'

import { Table, TableColumnsType, Transfer as AntTransfer, TransferProps as AntTransferProps } from 'antd'
import { SelectAllLabel }                                                                      from 'antd/es/transfer'
import { TableRowSelection }                                                                   from 'antd/lib/table/interface'
import { TransferItem }                                                                        from 'antd/lib/transfer'
import { useIntl }                                                                             from 'react-intl'

import * as UI from './styledComponents'

export type TransferProps =
  | AntTransferProps<TransferItem> & { type?: 'default' }
  | AntTransferProps<TransferItem> & {
      type: 'table'
      tableData: TransferItem[]
      leftColumns: TableColumnsType<TransferItem>
      rightColumns: TableColumnsType<TransferItem>
    }

export function Transfer (props: TransferProps) {
  const { $t } = useIntl()
  const { type = 'default' } = props

  let selectAllLabels = [
    ({ totalCount }) => (
      <div>
        <UI.Title>{props?.titles?.[0]}</UI.Title>
        <UI.SelectedCount>{$t({ defaultMessage: '{totalCount} available' }, {
          totalCount
        })}</UI.SelectedCount>
      </div>
    ),
    ({ totalCount }) => (
      <div>
        <UI.Title>{props?.titles?.[1]}</UI.Title>
        <UI.SelectedCount>{$t({ defaultMessage: '{totalCount} selected' }, {
          totalCount
        })}</UI.SelectedCount>
      </div>
    )
  ] as SelectAllLabel[]

  if (type === 'table') {
    const {
      leftColumns,
      rightColumns,
      tableData = []
    } = props as Extract<TransferProps, { type: 'table' }>

    return <UI.TransferLayout>
      <AntTransfer
        {...props}
        titles={[]}
        selectAllLabels={selectAllLabels}
        locale={{
          searchPlaceholder: $t({ defaultMessage: 'Search...' })
        }}
      >
        {({
          direction,
          filteredItems,
          onItemSelect,
          onItemSelectAll,
          selectedKeys: listSelectedKeys,
          disabled: listDisabled
        }) => {
          const columns = direction === 'left' ? leftColumns : rightColumns
          const rowSelection: TableRowSelection<TransferItem> = {
            getCheckboxProps: () => ({ disabled: listDisabled }),
            onChange (selectedRowKeys) {
              // @ts-ignore
              onItemSelectAll(selectedRowKeys, 'replace')
            },
            selectedRowKeys: listSelectedKeys
          }

          const dataSource = tableData.length > 0 && direction === 'left'
            ? filteredItems.filter(item => tableData.some(dataItem => dataItem.key === item.key))
            : filteredItems

          return (
            <Table
              rowSelection={{
                ...rowSelection,
                columnWidth: 0,
                columnTitle: '',
                hideSelectAll: true,
                renderCell: () => null
              }}
              columns={columns}
              dataSource={dataSource}
              size='small'
              style={{
                pointerEvents: listDisabled ? 'none' : undefined
              }}
              onRow={({ key, disabled: itemDisabled }) => ({
                onClick: () => {
                  if (itemDisabled || listDisabled) {
                    return
                  }
                  // @ts-ignore
                  onItemSelect(key, !listSelectedKeys.includes(key))
                }
              })}
            />
          )
        }}
      </AntTransfer>
    </UI.TransferLayout>
  }

  // default transfer
  return <UI.TransferLayout>
    <AntTransfer
      {...props}
      titles={[]}
      selectAllLabels={selectAllLabels}
      locale={{
        searchPlaceholder: $t({ defaultMessage: 'Search...' })
      }}
    />
  </UI.TransferLayout>
}
