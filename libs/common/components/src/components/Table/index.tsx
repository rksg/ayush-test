import React, { useMemo, useState, Key, useCallback, useEffect } from 'react'

import ProTable, { ProTableProps as ProAntTableProps } from '@ant-design/pro-table'
import { Space, Tooltip }                              from 'antd'
import _                                               from 'lodash'
import Highlighter                                     from 'react-highlight-words'
import { useIntl }                                     from 'react-intl'
import AutoSizer                                       from 'react-virtualized-auto-sizer'

import { SettingsOutlined } from '@acx-ui/icons'

import { Button } from '../Button'

import { FilterValue, getFilteredData, renderFilter, renderSearch } from './filters'
import { ResizableColumn }                                          from './ResizableColumn'
import * as UI                                                      from './styledComponents'
import { settingsKey, useColumnsState }                             from './useColumnsState'

import type { TableColumn, ColumnStateOption, ColumnGroupType, ColumnType, TableColumnState } from './types'
import type { ParamsType }                                                                    from '@ant-design/pro-provider'
import type { SettingOptionType }                                                             from '@ant-design/pro-table/lib/components/ToolBar'
import type {
  TableProps as AntTableProps,
  TablePaginationConfig
} from 'antd'
import type { RowSelectMethod } from 'antd/lib/table/interface'

export type {
  ColumnType,
  ColumnGroupType,
  RecordWithChildren,
  TableColumn
} from './types'

function isGroupColumn <RecordType, ValueType = 'text'> (
  column: TableColumn<RecordType, ValueType>
): column is ColumnGroupType<RecordType, ValueType> {
  return column.hasOwnProperty('children')
}

export interface TableProps <RecordType>
  extends Omit<ProAntTableProps<RecordType, ParamsType>,
  'bordered' | 'columns' | 'title' | 'type' | 'rowSelection'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip' | 'form'
    rowKey?: Exclude<ProAntTableProps<RecordType, ParamsType>['rowKey'], Function>
    columns: TableColumn<RecordType, 'text'>[]
    actions?: Array<{
      label: string
      onClick: () => void
    }>
    rowActions?: Array<{
      label: string,
      disabled?: boolean,
      tooltip?: string,
      visible?: boolean | ((selectedItems: RecordType[]) => boolean),
      onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
    }>
    columnState?: ColumnStateOption
    rowSelection?: (ProAntTableProps<RecordType, ParamsType>['rowSelection']
      & AntTableProps<RecordType>['rowSelection']
      & {
      alwaysShowAlert?: boolean;
    })
    extraSettings?: React.ReactNode[]
    onResetState?: CallableFunction
  }

const defaultPagination = {
  mini: true,
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 25, 50, 100],
  position: ['bottomCenter'],
  showTotal: false
}

function useSelectedRowKeys <RecordType> (
  rowSelection?: TableProps<RecordType>['rowSelection']
): [Key[], React.Dispatch<React.SetStateAction<Key[]>>] {
  const [selectedRowKeys, setSelectedRowKeys]
    = useState<Key[]>(rowSelection?.defaultSelectedRowKeys ?? [])

  useEffect(() => {
    if (rowSelection?.selectedRowKeys !== undefined) {
      setSelectedRowKeys(rowSelection?.selectedRowKeys)
    }
  }, [rowSelection?.selectedRowKeys])

  return [selectedRowKeys, setSelectedRowKeys]
}

// following the same typing from antd
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table <RecordType extends Record<string, any>> (
  { type = 'tall', columnState, ...props }: TableProps<RecordType>
) {
  const intl = useIntl()
  const { $t } = intl
  const [filterValues, setFilterValues] = useState<FilterValue>({} as FilterValue)
  const [searchValue, setSearchValue] = useState<string>('')
  const { dataSource } = props

  const [colWidth, setColWidth] = useState<Record<string, number>>({})

  let columns = useMemo(() => {
    const settingsColumn = {
      key: settingsKey,
      fixed: 'right' as 'right',
      width: 32,
      children: []
    }

    const cols = type === 'tall'
      ? [...props.columns, settingsColumn] as typeof props.columns
      : props.columns

    return cols.map(column => ({
      ...column,
      tooltip: null,
      title: column.tooltip ? <UI.TitleWithTooltip>
        {column.title as React.ReactNode}
        <UI.InformationTooltip title={column.tooltip as string} />
      </UI.TitleWithTooltip> : column.title,
      disable: Boolean(column.fixed || column.disable),
      show: Boolean(column.fixed || column.disable || (column.show ?? true)),
      children: isGroupColumn(column) ? column.children : undefined
    }))
  }, [props.columns, type])

  const columnsState = useColumnsState({ columns, columnState })

  const setting: SettingOptionType | false = type === 'tall' ? {
    draggable: true,
    checkable: true,
    checkedReset: false,
    extra: <div>
      <UI.TableSettingTitle children={$t({ defaultMessage: 'Select Columns' })} />
      {props.extraSettings?.map((section, i) =>
        <UI.SettingSection key={i}>{section}</UI.SettingSection>
      )}
      <UI.SettingSection>
        <Button
          type='link'
          size='small'
          onClick={() => {
            columnsState.resetState()
            props.onResetState?.()
            setColWidth({})
          }}
          children={$t({ defaultMessage: 'Reset to default' })}
        />
      </UI.SettingSection>
    </div>,
    children: <SettingsOutlined/>
  } : false

  const rowKey = (props.rowKey ?? 'key') as keyof RecordType

  const [selectedRowKeys, setSelectedRowKeys] = useSelectedRowKeys(props.rowSelection)

  const getSelectedRows = useCallback((selectedRowKeys: Key[]) => {
    return props.dataSource?.filter(item => {
      return selectedRowKeys.includes(item[rowKey] as unknown as Key)
    }) ?? []
  }, [props.dataSource, rowKey])

  const onRowClick = (record: RecordType) => {
    if (!props.rowSelection) return
    if (rowSelection?.getCheckboxProps?.(record)?.disabled) return

    const key = record[rowKey] as unknown as Key
    const isSelected = selectedRowKeys.includes(key)

    let newKeys: Key[] | undefined
    let type: RowSelectMethod
    if (props.rowSelection.type === 'radio') {
      type = 'single'
      if (!isSelected) {
        newKeys = [key]
      }
    } else {
      type = 'multiple'
      newKeys = isSelected
        // remove if selected
        ? selectedRowKeys.filter(k => k !== key)
        // add into collection if not selected
        : [...selectedRowKeys, key]
    }
    if (!newKeys) return
    setSelectedRowKeys(newKeys)
    props.rowSelection?.onChange?.(newKeys, getSelectedRows(newKeys), { type })
  }
  columns = columns.map(column => column.searchable && searchValue
    ? {
      ...column,
      render: (_, value) => <Highlighter
        highlightStyle={{ fontWeight: 'bold', background: 'none', padding: 0 }}
        searchWords={[searchValue]}
        textToHighlight={value[column.dataIndex as keyof RecordType] as unknown as string}
        autoEscape
      />
    }
    : column
  )

  const filterables = columns.filter(column => {
    return column.filterable
  })
  const searchables = columns.filter(column => column.searchable)
  const activeFilters = filterables.filter(column => {
    const key = column.dataIndex as keyof RecordType
    const filteredValue = filterValues[key as keyof FilterValue]
    return filteredValue
  })
  const hasRowSelected = Boolean(selectedRowKeys.length)
  const hasHeader = !hasRowSelected && (Boolean(filterables.length) || Boolean(searchables.length))
  const rowSelection: TableProps<RecordType>['rowSelection'] = props.rowSelection ? {
    ..._.omit(props.rowSelection, 'defaultSelectedRowKeys'),
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys, rows, info) => {
      setSelectedRowKeys(keys)
      props.rowSelection?.onChange?.(keys, rows, info)
    }
  } : undefined
  const hasEllipsisColumn = columns.some(column => column.ellipsis)
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

  const getResizeProps = (col: ColumnType<RecordType> | ColumnGroupType<RecordType, 'text'>) => ({
    ...col,
    width: (col.key === settingsKey)
      ? col.width
      : colWidth[col.key as keyof typeof colWidth] || col.width,
    onHeaderCell: (column: TableColumn<RecordType, 'text'>) => ({
      width: colWidth[column.key],
      onResize: (width: number) => setColWidth({ ...colWidth, [column.key]: width })
    })
  })

  const WrappedTable = (style: { width?: number }) => <UI.Wrapper
    style={style}
    $type={type}
    $rowSelectionActive={Boolean(props.rowSelection) && !hasHeader}
  >
    <UI.TableSettingsGlobalOverride />
    {props.actions && <Space
      size={0}
      split={<UI.Divider type='vertical' />}
      style={{ display: 'flex', justifyContent: 'flex-end' }}>
      {props.actions?.map((action, index) => <Button
        key={index}
        type='link'
        size='small'
        onClick={action.onClick}
        children={action.label}
      />)}
    </Space>}
    {hasHeader && (
      <UI.Header>
        <div>
          <Space size={12}>
            {Boolean(searchables.length) &&
              renderSearch<RecordType>(intl, searchables, searchValue, setSearchValue)
            }
            {filterables.map((column, i) =>
              renderFilter<RecordType>(column, i, dataSource, filterValues, setFilterValues)
            )}
          </Space>
        </div>
        <UI.HeaderRight>
          {(Boolean(activeFilters.length) || Boolean(searchValue)) && <Button
            onClick={() => {
              setFilterValues({} as FilterValue)
              setSearchValue('')
            }}
          >
            {$t({ defaultMessage: 'Clear Filters' })}
          </Button>}
        </UI.HeaderRight>
      </UI.Header>
    )}
    <ProTable<RecordType>
      {...props}
      dataSource={getFilteredData<RecordType>(
        dataSource, filterValues, activeFilters, searchables, searchValue
      )}
      bordered={false}
      search={false}
      columns={(type === 'tall' ? columns.map(col=>({
        ...getResizeProps(col),
        children: col.children?.map(getResizeProps)
      })): columns) as typeof columns}
      components={type === 'tall' ? { header: { cell: ResizableColumn } } : undefined}
      options={{ setting, reload: false, density: false }}
      columnsState={{
        ...columnsState,
        onChange: (state: TableColumnState) => {
          columnsState.onChange(state)
          setColWidth({})
        }
      }}
      scroll={{ x: hasEllipsisColumn ? '100%' : 'max-content' }}
      rowSelection={rowSelection}
      pagination={(type === 'tall'
        ? { ...defaultPagination, ...props.pagination || {} } as TablePaginationConfig
        : false)}
      columnEmptyText={false}
      onRow={onRow}
      showSorterTooltip={false}
      tableAlertOptionRender={false}
      tableAlertRender={({ onCleanSelected }) => (
        <Space size={32}>
          <Space size={6}>
            <span>
              {$t({ defaultMessage: '{count} selected' }, { count: selectedRowKeys.length })}
            </span>
            <UI.CloseButton
              onClick={onCleanSelected}
              title={$t({ defaultMessage: 'Clear selection' })}
              data-id='table-clear-btn'
            />
          </Space>
          <Space size={0} split={<UI.Divider type='vertical' />}>
            {props.rowActions?.map((option) => {
              const rows = getSelectedRows(selectedRowKeys)
              const label = option.tooltip
                ? <Tooltip placement='top' title={option.tooltip}>{option.label}</Tooltip>
                : option.label
              let visible = typeof option.visible === 'function'
                ? option.visible(rows)
                : option.visible ?? true

              if (!visible) return null
              return <UI.ActionButton
                key={option.label}
                disabled={option.disabled}
                onClick={() =>
                  option.onClick(getSelectedRows(selectedRowKeys), () => { onCleanSelected() })}
              >
                {label}
              </UI.ActionButton>
            })}
          </Space>
        </Space>
      )}
    />
  </UI.Wrapper>
  if (hasEllipsisColumn) {
    return <AutoSizer>{({ width }) => WrappedTable({ width })}</AutoSizer>
  } else {
    return WrappedTable({})
  }
}

Table.SubTitle = UI.SubTitle

export { Table }
