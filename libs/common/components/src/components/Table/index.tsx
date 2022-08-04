import React, { useState, Key } from 'react'

import ProTable           from '@ant-design/pro-table'
import { Space, Divider } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import * as UI from './styledComponents'

import type { ProColumns }                  from '@ant-design/pro-table'
import type { TableProps as AntTableProps } from 'antd'

export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered' | 'columns' > {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip'
    rowKey?: Exclude<AntTableProps<RecordType>['rowKey'], Function>
    columns?: ProColumns<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
    }>
  }

export function Table <RecordType extends object> (
  { type = 'tall', ...props }: TableProps<RecordType>
) {
  const { $t } = useIntl()
  const rowKey = (props.rowKey ?? 'key') as keyof RecordType

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(props.rowSelection?.selectedRowKeys
    ?? props.rowSelection?.defaultSelectedRowKeys
    ?? [])

  // needed to store selectedRows because `tableAlertRender`
  // somehow doesn't pass in sync selected data between selectedRows & selectedRowKeys
  const [selectedRows, setSelectedRows]
    = useState<RecordType[]>(props.dataSource
      ?.filter(item => selectedRowKeys.includes(item[rowKey] as unknown as Key)) ?? [])

  const onRowClick = (record: RecordType) => {
    if (!props.rowSelection) return

    const key = record[rowKey] as unknown as Key
    const isSelected = selectedRowKeys.includes(key)

    if (props.rowSelection.type === 'radio') {
      if (!isSelected) {
        setSelectedRowKeys([key])
        setSelectedRows([record])
      }
    } else {
      setSelectedRowKeys(isSelected
        // remove if selected
        ? selectedRowKeys.filter(k => k !== key)
        // add into collection if not selected
        : [...selectedRowKeys, key])
      setSelectedRows(isSelected
        // remove if selected
        ? selectedRows.filter(item => item[rowKey] !== record[rowKey])
        // add into collection if not selected
        : [...selectedRows, record])
    }
  }

  const rowSelection: TableProps<RecordType>['rowSelection'] = props.rowSelection ? {
    ..._.omit(props.rowSelection, 'defaultSelectedRowKeys'),
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys, rows, info) => {
      setSelectedRowKeys(keys)
      setSelectedRows(rows)
      props.rowSelection?.onChange?.(keys, rows, info)
    }
  } : undefined

  const onRow: TableProps<RecordType>['onRow'] = function (record) {
    const defaultOnRow = props.onRow?.(record)
    return {
      ...defaultOnRow,
      onClick: (event) => {
        onRowClick(record)
        defaultOnRow?.onClick?.(event)
      }
    }
  }

  const tableAlertRender = ({ onCleanSelected }: { onCleanSelected: () => void }) => (
    <Space size={32}>
      <Space size={6}>
        <span>{$t({ defaultMessage: '{count} selected' }, { count: selectedRows.length })}</span>
        <UI.CloseButton
          onClick={onCleanSelected}
          title={$t({ defaultMessage: 'Clear selection' })}
        />
      </Space>
      <Space size={0} split={<Divider type='vertical' />}>
        {props.actions?.map((option) =>
          <UI.ActionButton
            key={option.label}
            onClick={() => option.onClick(selectedRows, () => { onCleanSelected() })}
            children={option.label}
          />
        )}
      </Space>
    </Space>
  )

  return <UI.Wrapper $type={type} $rowSelection={props.rowSelection}>
    <ProTable<RecordType>
      {...props}
      bordered={false}
      options={false}
      search={false}
      rowSelection={rowSelection}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columns={props.columns}
      columnEmptyText={false}
      onRow={onRow}
      tableAlertRender={tableAlertRender}
      tableAlertOptionRender={false}
    />
  </UI.Wrapper>
}
