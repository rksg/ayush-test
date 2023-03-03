import React, { useMemo, useState, Key, useCallback, useEffect } from 'react'

import ProTable, { ProTableProps as ProAntTableProps, ProColumnType } from '@ant-design/pro-table'
import { Menu, MenuProps, Space }                                     from 'antd'
import escapeStringRegexp                                             from 'escape-string-regexp'
import _                                                              from 'lodash'
import Highlighter                                                    from 'react-highlight-words'
import { useIntl }                                                    from 'react-intl'
import AutoSizer                                                      from 'react-virtualized-auto-sizer'

import { SettingsOutlined }        from '@acx-ui/icons'
import { TABLE_DEFAULT_PAGE_SIZE } from '@acx-ui/utils'

import { Button, DisabledButton } from '../Button'
import { Dropdown }               from '../Dropdown'
import { Tooltip }                from '../Tooltip'

import { Filter, getFilteredData, renderFilter, renderGroupBy, renderSearch } from './filters'
import { ResizableColumn }                                                    from './ResizableColumn'
import * as UI                                                                from './styledComponents'
import { settingsKey, useColumnsState }                                       from './useColumnsState'

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
    type?: 'tall' | 'compact' | 'tooltip' | 'form' | 'compactBordered'
    rowKey?: ProAntTableProps<RecordType, ParamsType>['rowKey']
    columns: TableColumn<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      disabled?: boolean,
      tooltip?: string,
      onClick?: () => void,
      dropdownMenu?: Omit<MenuProps, 'placement'>
    }>
    rowActions?: Array<{
      label: string,
      disabled?: boolean | ((selectedItems: RecordType[]) => boolean),
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
    enableApiFilter?: boolean
    onFilterChange?: (
      filters: Filter,
      search: { searchString?: string, searchTargetFields?: string[] }
    ) => void,
    groupable?: {
      selectors: { key: string, label: string }[]
      onChange: CallableFunction,
      onClear: CallableFunction
      actions?: { key: string, label: string, callback: CallableFunction }[]
    }
  }

export interface TableHighlightFnArgs {
  (
    textToHighlight: string,
    formatFn?: (keyword: string) => React.ReactNode
  ): string | React.ReactNode
}

const defaultPagination = {
  mini: true,
  defaultPageSize: TABLE_DEFAULT_PAGE_SIZE,
  pageSizeOptions: [5, 10, 20, 25, 50, 100],
  position: ['bottomCenter'],
  showTotal: false,
  showSizeChanger: true
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

const MIN_SEARCH_LENGTH = 2

// following the same typing from antd
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table <RecordType extends Record<string, any>> ({
  type = 'tall', columnState, enableApiFilter, onFilterChange, groupable, ...props
}: TableProps<RecordType>) {
  const intl = useIntl()
  const { $t } = intl
  const [filterValues, setFilterValues] = useState<Filter>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const { dataSource } = props

  const [colWidth, setColWidth] = useState<Record<string, number>>({})

  const debounced = useCallback(_.debounce((filter: Filter, searchString: string) =>
    onFilterChange && onFilterChange(filter, { searchString }), 1000), [onFilterChange])

  const { GroupBySelect } = renderGroupBy(groupable)

  useEffect(() => {
    if(searchValue === '' || searchValue.length >= MIN_SEARCH_LENGTH)  {
      debounced(filterValues, searchValue)
    }
    return () => debounced.cancel()
  }, [searchValue, debounced])

  useEffect(() => {
    debounced(filterValues, searchValue)
    return () => debounced.cancel()
  }, [filterValues, debounced])

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

  const setting: SettingOptionType | false = type === 'tall' && !columnState?.hidden ? {
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

  const rowKey = (props.rowKey ?? 'key')
  const [selectedRowKeys, setSelectedRowKeys] = useSelectedRowKeys(props.rowSelection)
  const getSelectedRows = useCallback((selectedRowKeys: Key[]) => {
    return props.dataSource?.filter(item => {
      return selectedRowKeys.includes(typeof rowKey === 'function' ?
        rowKey(item) : item[rowKey] as unknown as Key)
    }) ?? []
  }, [props.dataSource, rowKey])
  const onRowClick = (record: RecordType) => {
    if (!props.rowSelection) return
    if (rowSelection?.getCheckboxProps?.(record)?.disabled) return

    const key = typeof rowKey === 'function' ? rowKey(record) : record[rowKey] as unknown as Key
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

  const aggregator = (
    columns: TableColumn<RecordType, 'text'>[],
    field: keyof TableColumn<RecordType, 'text'>
  ) => Object.values(columns.reduce((all, column) => {
    if(column[field]) { all[column.key] = column }
    if(isGroupColumn(column) && column.children?.length > 0)
      column.children.forEach((child) => {
        if(child[field]) { all[child.key] = child }
      })
    return all
  }, {} as Record<string, TableColumn<RecordType, 'text'>>))

  const filterables = aggregator(columns, 'filterable')
  const searchables = aggregator(columns, 'searchable')

  const activeFilters = filterables.filter(column => {
    const key = column.dataIndex as keyof RecordType
    const filteredValue = filterValues[key as keyof Filter]
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

  let pagination: false | TablePaginationConfig = false
  if (type === 'tall') {
    pagination = { ...defaultPagination, ...props.pagination || {} } as TablePaginationConfig
    if ((pagination.total || dataSource?.length || 0) < pagination.defaultPageSize!) {
      pagination = false
    }
  }

  const hasEllipsisColumn = columns.some(column => column.ellipsis)

  const components = _.merge({},
    props.components || {},
    type === 'tall' ? { header: { cell: ResizableColumn } } : {}
  ) as TableProps<RecordType>['components']

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

  const columnResize = (col: ColumnType<RecordType> | ColumnGroupType<RecordType, 'text'>) =>
    (type === 'tall')
      ? ({
        ...col,
        width: (col.key === settingsKey)
          ? col.width
          : colWidth[col.key as keyof typeof colWidth] || col.width,
        onHeaderCell: (column: TableColumn<RecordType, 'text'>) => ({
          onResize: (width: number) => setColWidth({ ...colWidth, [column.key]: width }),
          hasEllipsisColumn,
          width: colWidth[column.key],
          definedWidth: col.width
        })
      })
      : col

  const columnRender = (col: ColumnType<RecordType> | ColumnGroupType<RecordType, 'text'>) => ({
    ...col,
    ...( col.searchable && {
      render: ((dom, entity, index, action, schema) => {
        const highlightFn: TableHighlightFnArgs = (textToHighlight, formatFn) =>
          (searchValue && searchValue.length >= MIN_SEARCH_LENGTH && textToHighlight)
            ? formatFn
              ? textToHighlight.replace(
                new RegExp(escapeStringRegexp(searchValue), 'ig'), formatFn('$&') as string)
              : <Highlighter
                highlightStyle={{
                  fontWeight: 'bold', background: 'none', padding: 0, color: 'inherit' }}
                searchWords={[searchValue]}
                textToHighlight={textToHighlight}
                autoEscape
              />
            : textToHighlight
        return col.render
          ? col.render(dom, entity, index, highlightFn, action, schema)
          : highlightFn(_.get(entity, col.dataIndex))
      }) as ProColumnType<RecordType, 'text'>['render']
    })
  })

  const finalColumns = columns.map(column => ({
    ..._.flow([columnResize, columnRender])(column),
    ...(column.children && {
      children: column.children.map(child => _.flow([columnRender, columnResize])(child))
    })
  }))

  const WrappedTable = (style: { width?: number }) => <UI.Wrapper
    style={style}
    $type={type}
    $rowSelectionActive={
      Boolean(props.rowSelection) && !hasHeader && props.tableAlertRender !== false
    }
  >
    <UI.TableSettingsGlobalOverride />
    {props.actions && <Space
      size={0}
      split={<UI.Divider type='vertical' />}
      style={{ display: 'flex', justifyContent: 'flex-end', margin: '3px 0' }}>
      {props.actions?.map((action, index) => {
        const content = !action.disabled
          ? <Button
            key={index}
            type='link'
            size='small'
            onClick={action.dropdownMenu ? undefined : action.onClick}
            children={action.label}
          />
          : <DisabledButton
            key={index}
            type='link'
            size='small'
            title={action.tooltip || ''}
            children={action.label}
          />
        return action.dropdownMenu
          ? <Dropdown
            key={`dropdown-${index}`}
            overlay={<Menu {...action.dropdownMenu} />}
            disabled={action.disabled}>
            {() => content }
          </Dropdown>
          : content
      })}
    </Space>}
    {hasHeader && (
      <UI.Header>
        <div>
          <Space size={12}>
            {Boolean(searchables.length) &&
              renderSearch<RecordType>(intl, searchables, searchValue, setSearchValue)
            }
            {filterables.map((column, i) =>
              renderFilter<RecordType>(
                column, i, dataSource, filterValues, setFilterValues, !!enableApiFilter)
            )}
            <GroupBySelect />
            <UI.HeaderRight>
              {(Boolean(activeFilters.length) ||
            (Boolean(searchValue) && searchValue.length >= MIN_SEARCH_LENGTH))
            && <Button onClick={() => {
              setFilterValues({} as Filter)
              setSearchValue('')
            }}>
              {$t({ defaultMessage: 'Clear Filters' })}
            </Button>}
            </UI.HeaderRight>
          </Space>
        </div>
      </UI.Header>
    )}
    <ProTable<RecordType>
      {...props}
      dataSource={enableApiFilter
        ? dataSource
        : getFilteredData<RecordType>(
          dataSource, filterValues, activeFilters, searchables, searchValue)
      }
      sortDirections={['ascend', 'descend', 'ascend']}
      bordered={false}
      search={false}
      columns={finalColumns}
      components={_.isEmpty(components) ? undefined : components}
      options={{ setting, reload: false, density: false }}
      columnsState={{
        ...columnsState,
        onChange: (state: TableColumnState) => {
          columnsState.onChange(state)
          setColWidth({})
        }
      }}
      scroll={{ x: hasEllipsisColumn || type !== 'tall' ? '100%' : 'max-content' }}
      rowSelection={rowSelection}
      pagination={pagination}
      columnEmptyText={false}
      onRow={onRow}
      showSorterTooltip={false}
      tableAlertOptionRender={false}
      tableAlertRender={props.tableAlertRender ?? (({ onCleanSelected }) => (
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
              return <Button
                type='link'
                size='small'
                key={option.label}
                disabled={typeof option.disabled === 'function'
                  ? option.disabled(rows)
                  : option.disabled
                }
                onClick={() =>
                  option.onClick(getSelectedRows(selectedRowKeys), () => { onCleanSelected() })}
              >
                {label}
              </Button>
            })}
          </Space>
        </Space>
      ))}
    />
  </UI.Wrapper>
  if (hasEllipsisColumn) {
    return <AutoSizer>{({ width }) => WrappedTable({ width })}</AutoSizer>
  } else {
    return WrappedTable({})
  }
}

Table.SubTitle = UI.SubTitle
Table.Highlighter = UI.Highlighter

export { Table }
