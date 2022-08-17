import React, { useState, Key, useRef, useEffect } from 'react'

import ProTable                          from '@ant-design/pro-table'
import { Space, Divider, Button }        from 'antd'
import _                                 from 'lodash'
import { useIntl }                       from 'react-intl'
import { Resizable, ResizeCallbackData } from 'react-resizable'

import { SettingsOutlined } from '@acx-ui/icons'

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

interface ResizableColumnProps {
  onResize: (e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => void
  width: number
}

const ResizableColumn: React.FC<ResizableColumnProps> = (props) => {
  const { onResize, width: columnWidth, ...rest } = props
  const [width, setWidth] = useState(columnWidth)
  const refContainer = useRef<HTMLTableHeaderCellElement>(null)
  useEffect(()=>{
    if(refContainer){
      setWidth(refContainer.current?.offsetWidth as number)
    }
  }, [refContainer])
  if(!width) {
    return <th ref={refContainer} {...rest} />
  }
  return <Resizable
    width={width}
    height={0}
    handle={
      <span
        className='react-resizable-handle'
        onClick={e => { e.stopPropagation() }}
      />
    }
    onResize={(_: React.SyntheticEvent<Element>, callbackData: ResizeCallbackData)=>{
      onResize(_, callbackData)
      setWidth(callbackData.size.width)
    }}
    draggableOpts={{ enableUserSelectHack: false }}
    children={<th ref={refContainer} {...rest} />}
  />
}

export function Table <RecordType extends object> (
  { type = 'tall', columnState, ...props }: TableProps<RecordType>
) {
  const { $t } = useIntl()

  const [columns, setColumns ] = useState(() => {
    const settingsColumn = {
      key: settingsKey,
      fixed: 'right' as 'right',
      width: 32,
      children: []
    }

    const cols = type === 'tall'
      ? [...props.columns, settingsColumn] as typeof props.columns
      : props.columns

    return cols.map((column, index) => ({
      ...column,
      disable: Boolean(column.fixed || column.disable),
      show: Boolean(column.fixed || column.disable || (column.show ?? true)),
      onHeaderCell: (column: Columns<RecordType, 'text'>) => ({
        width: column.width,
        onResize: onColumnResize(index)
      })
    })) as unknown as typeof props.columns
  }) //, [props.columns, type])

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

  const onColumnResize = (index: number) =>
    (_: React.SyntheticEvent<Element>, { size }: ResizeCallbackData) => {
      const newColumns = [...columns]
      newColumns[index] = { ...newColumns[index], width: size.width }
      setColumns(newColumns)
    }

  return <UI.Wrapper $type={type} $hasRowSelection={Boolean(props.rowSelection)}>
    <UI.TableSettingsGlobalOverride />
    <ProTable<RecordType>
      {...props}
      bordered={false}
      search={false}
      columns={columns}
      components={{ header: { cell: ResizableColumn } }}
      options={{ setting, reload: false, density: false }}
      columnsState={columnsState}
      scroll={{ x: 'max-content' }}
      rowSelection={rowSelection}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columnEmptyText={false}
      onRow={onRow}
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
