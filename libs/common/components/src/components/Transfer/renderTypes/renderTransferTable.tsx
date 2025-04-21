import React from 'react'

import { Table }                 from 'antd'
import { TransferListBodyProps } from 'antd/es/transfer/ListBody'
import { TableRowSelection }     from 'antd/lib/table/interface'
import { TransferItem }          from 'antd/lib/transfer'

import { TransferProps } from '../index'

// eslint-disable-next-line max-len
export const renderTransferTable = ( props: Extract<TransferProps, { type: 'table' }>, transferProps: TransferListBodyProps<TransferItem> ) => {
  const {
    leftColumns,
    rightColumns,
    tableData = []
  } = props as Extract<TransferProps, { type: 'table' }>

  const {
    direction,
    filteredItems,
    onItemSelect,
    onItemSelectAll,
    selectedKeys: listSelectedKeys,
    disabled: listDisabled
  } = transferProps

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
}
