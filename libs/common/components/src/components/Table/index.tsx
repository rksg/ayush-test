import React, { useState, Key, useMemo } from 'react'

import ProTable                   from '@ant-design/pro-table'
import { Space, Divider, Button } from 'antd'
import _                          from 'lodash'
import { useIntl }                from 'react-intl'

import { SettingsOutlined } from '@acx-ui/icons'

import { ResizableColumn }              from './ResizableColumn'
import * as UI                          from './styledComponents'
import { settingsKey, useColumnsState } from './useColumnsState'

import type { Columns, ColumnStateOption }  from './types'
import type { SettingOptionType }           from '@ant-design/pro-table/lib/components/ToolBar'
import type { TableProps as AntTableProps } from 'antd'

export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered' | 'columns' | 'title'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip'
    rowKey?: Exclude<AntTableProps<RecordType>['rowKey'], Function>
    columns: Columns<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
    }>
    columnState?: ColumnStateOption
  }

export function Table <RecordType extends object> (
  { type = 'tall', columnState, ...props }: TableProps<RecordType>
) {
  const { $t } = useIntl()

  const [colWidth, setColWidth] = useState<Record<string, number>>({})

  const columns = useMemo(() => {
    const settingsColumn = {
      key: settingsKey,
      fixed: 'right' as 'right',
      width: 32,
      children: []
    }

    const cols = type === 'tall'
      ? [...props.columns, settingsColumn] as typeof props.columns
      : props.columns

    return cols.map((column) => ({
      ...column,
      disable: Boolean(column.fixed || column.disable),
      show: Boolean(column.fixed || column.disable || (column.show ?? true))
    }))
  }, [props.columns, type])

  const columnsState = useColumnsState({ columns, columnState })

  const setting: SettingOptionType | false = type === 'tall' ? {
    draggable: true,
    checkable: true,
    checkedReset: false,
    extra: <div>
      <UI.TableSettingTitle children={$t({ defaultMessage: 'Select Columns' })} />
      <Button
        type='link'
        size='small'
        onClick={columnsState.resetState}
        children={$t({ defaultMessage: 'Reset to default' })}
      />
    </div>,
    children: <SettingsOutlined />
  } : false

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

  return <UI.Wrapper $type={type} $hasRowSelection={Boolean(props.rowSelection)}>
    <UI.TableSettingsGlobalOverride />
    <ProTable<RecordType>
      {...props}
      bordered={false}
      search={false}
      columns={columns.map(col=>({
        ...col,
        width: (col.key === settingsKey)? col.width : colWidth[col.key],
        onHeaderCell: (column: Columns<RecordType, 'text'>) => ({
          width: colWidth[column.key],
          onResize: (width: number) => setColWidth({ ...colWidth, [column.key]: width })
        })
      })) as typeof columns}
      components={{ header: { cell: ResizableColumn } }}
      options={{ setting, reload: false, density: false }}
      columnsState={columnsState}
      scroll={{ x: 'max-content' }}
      rowSelection={rowSelection}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columnEmptyText={false}
      onRow={onRow}
      showSorterTooltip={false}
      tableAlertOptionRender={false}
      tableAlertRender={({ onCleanSelected }) => (
        <Space size={32}>
          <Space size={6}>
            <span>
              {$t({ defaultMessage: '{count} selected' }, { count: selectedRows.length })}
            </span>
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
      )}
    />
  </UI.Wrapper>
}
