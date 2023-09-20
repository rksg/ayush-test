import React, { useMemo, useState, Key, useEffect, useRef, useDebugValue } from 'react'

import ProTable, { ProTableProps as ProAntTableProps, ProColumnType } from '@ant-design/pro-table'
import { Menu, Space }                                                from 'antd'
import escapeStringRegexp                                             from 'escape-string-regexp'
import _                                                              from 'lodash'
import Highlighter                                                    from 'react-highlight-words'
import { useIntl }                                                    from 'react-intl'

import { SettingsOutlined }        from '@acx-ui/icons'
import { TABLE_DEFAULT_PAGE_SIZE } from '@acx-ui/utils'

import { Button, DisabledButton, ButtonProps } from '../Button'
import { Dropdown }                            from '../Dropdown'
import { useLayoutContext }                    from '../Layout'
import { Tooltip }                             from '../Tooltip'

import {
  Filter,
  getFilteredData,
  renderFilter,
  renderSearch,
  MIN_SEARCH_LENGTH
} from './filters'
import { useGroupBy, GroupSelect }                                            from './groupBy'
import { IconButton }                                                         from './IconButton'
import { ResizableColumn }                                                    from './ResizableColumn'
import * as UI                                                                from './styledComponents'
import { defaultColumnWidth, settingsKey, settingsKeyWidth, useColumnsState } from './useColumnsState'

import type {
  TableColumn,
  TableColumnState,
  ColumnType,
  ColumnGroupType,
  ColumnStateOption,
  TableAction,
  TableRowAction,
  IconButtonProps
} from './types'
import type { ParamsType }        from '@ant-design/pro-provider'
import type { SettingOptionType } from '@ant-design/pro-table/lib/components/ToolBar'
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

export interface TableProps <RecordType>
  extends Omit<ProAntTableProps<RecordType, ParamsType>,
  'bordered' | 'columns' | 'title' | 'type' | 'rowSelection'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip' | 'form' | 'compactBordered'
    rowKey?: ProAntTableProps<RecordType, ParamsType>['rowKey']
    columns: TableColumn<RecordType, 'text'>[]
    actions?: Array<TableAction>
    rowActions?: Array<TableRowAction<RecordType>>
    settingsId?: string
    columnState?: ColumnStateOption
    rowSelection?: (ProAntTableProps<RecordType, ParamsType>['rowSelection']
      & AntTableProps<RecordType>['rowSelection']
      & { alwaysShowAlert?: boolean }
    )
    extraSettings?: React.ReactNode[]
    onResetState?: CallableFunction
    enableApiFilter?: boolean
    floatRightFilters?: boolean
    alwaysShowFilters? : boolean
    onFilterChange?: (
      filters: Filter,
      search: { searchString?: string, searchTargetFields?: string[] },
      groupBy?: string | undefined
    ) => void
    iconButton?: IconButtonProps,
    filterableWidth?: number,
    searchableWidth?: number,
    onDisplayRowChange?: (displayRows: RecordType[]) => void,
    getAllPagesData?: () => RecordType[]
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
): [Key[], React.Dispatch<React.SetStateAction<Key[]>>,
  RecordType[], React.Dispatch<React.SetStateAction<RecordType[]>>,
  RecordType[], React.Dispatch<React.SetStateAction<RecordType[]>>
] {
  const [selectedRowKeys, setSelectedRowKeys]
    = useState<Key[]>(rowSelection?.defaultSelectedRowKeys ?? [])
  const [selectedRows, setSelectedRows]
    = useState<RecordType[]>([])
  const [allRows, setAllRows]
    = useState<RecordType[]>([])

  useEffect(() => {
    if (rowSelection?.selectedRowKeys !== undefined) {
      setSelectedRowKeys(rowSelection?.selectedRowKeys)
    }
    if (rowSelection?.selectedRowKeys?.length === 0) {
      setSelectedRows([])
      setAllRows([])
    }
  }, [rowSelection?.selectedRowKeys])

  return [selectedRowKeys, setSelectedRowKeys, selectedRows, setSelectedRows, allRows, setAllRows]
}

// following the same typing from antd
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Table <RecordType extends Record<string, any>> ({
  type = 'tall', columnState, enableApiFilter, iconButton, onFilterChange, settingsId,
  onDisplayRowChange, ...props
}: TableProps<RecordType>) {
  const { dataSource, filterableWidth, searchableWidth, style } = props
  const layout = useLayoutContext()
  const rowKey = (props.rowKey ?? 'key')
  const intl = useIntl()
  const { $t } = intl
  const [filterValues, setFilterValues] = useState<Filter>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [groupByValue, setGroupByValue] = useState<string | undefined>(undefined)
  const onFilter = useRef(onFilterChange)
  const [colWidth, setColWidth] = useState<Record<string, number>>(
    props.columns.reduce(function colWidthReducer (acc, col) {
      if (_.has(col, 'children')) return _.get(col, 'children').reduce(colWidthReducer, acc)
      const num = Number.isFinite(col.width)
        ? Number(col.width)
        : defaultColumnWidth * (Number(col.width === Infinity) * 2 + 1)
      acc[col.key] = num
      return acc
    }, {} as Record<string, number>)
  )
  useDebugValue(colWidth)
  const getRowKey = (data: RecordType) => {
    return typeof rowKey === 'function' ? rowKey(data) : data[rowKey] as unknown as Key
  }
  const allKeys = dataSource?.map(row => getRowKey(row))
  const updateSearch = _.debounce(() => {
    onFilter.current?.(filterValues, { searchString: searchValue }, groupByValue)
  }, 1000)
  const filterWidth = filterableWidth || 200
  const searchWidth = searchableWidth || 292

  useEffect(() => {
    onFilter.current = onFilterChange
  }, [onFilterChange])

  useEffect(() => {
    if(searchValue === '' || searchValue.length >= MIN_SEARCH_LENGTH) {
      updateSearch()
    }
    return () => updateSearch.cancel()
  }, [searchValue]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onFilter.current?.(filterValues, { searchString: searchValue }, groupByValue)
  }, [filterValues, groupByValue]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onDisplayRowChange?.((enableApiFilter
      ? dataSource?.slice()
      : getFilteredData<RecordType>(
        dataSource, filterValues, activeFilters, searchables, searchValue)) ?? [])
  }, [dataSource, onDisplayRowChange, searchValue, filterValues])

  useEffect(() => {
    if (dataSource) {
      const tmp: React.SetStateAction<RecordType[]> = []
      selectedRows.forEach(row => {
        const tmpRow = dataSource?.find(item => getRowKey(item) == getRowKey(row))
        if(tmpRow) {
          tmp.push(tmpRow)
        }else {
          tmp.push(row)
        }
      })
      setSelectedRows(tmp)
    }
  }, [dataSource])

  const baseColumns = useMemo(() => {
    const settingsColumn = {
      key: settingsKey,
      fixed: 'right' as 'right',
      width: settingsKeyWidth,
      children: []
    }

    const cols = type === 'tall'
      ? [...props.columns, settingsColumn] as typeof props.columns
      : props.columns

    return cols.map(column => ({
      ...column,
      tooltip: null,
      title: column.tooltip
        ? <UI.TitleWithTooltip>
          {column.title as React.ReactNode}
          <UI.InformationTooltip title={column.tooltip as string} />
        </UI.TitleWithTooltip>
        : column.title,
      disable: Boolean(column.fixed || column.disable),
      show: Boolean(column.fixed || column.disable || (column.show ?? true)),
      ellipsis: type === 'tall' && column.key !== settingsKey,
      children: 'children' in column
        ? column.children.map(child => ({ ...child, ellipsis: type === 'tall' }))
        : undefined
    }))
  }, [props.columns, type]) // eslint-disable-line react-hooks/exhaustive-deps

  const columnsState = useColumnsState({ settingsId, columns: baseColumns, columnState })
  const { groupable, expandable, columns, isGroupByActive, onExpand } =
  useGroupBy<RecordType>(baseColumns, allKeys, groupByValue, columnsState.value, rowKey)

  const setting: SettingOptionType | false = type === 'tall' && settingsId ? {
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
          }}
          children={$t({ defaultMessage: 'Reset to default' })}
        />
      </UI.SettingSection>
    </div>,
    children: <SettingsOutlined/>
  } : false

  const [selectedRowKeys, setSelectedRowKeys, selectedRows, setSelectedRows, allRows, setAllRows] =
  useSelectedRowKeys(props.rowSelection)

  const onRowClick = (record: RecordType) => {
    if (
      !props.rowSelection ||
      rowSelection?.getCheckboxProps?.(record)?.disabled
    )
      return

    const key = getRowKey(record)
    const isSelected = selectedRowKeys.includes(key)

    let newKeys: Key[] | undefined
    let newRows: RecordType[] | undefined
    let type: RowSelectMethod
    if (props.rowSelection.type === 'radio') {
      type = 'single'
      if (!isSelected) {
        newKeys = [key]
        newRows = [record]
      }
    } else {
      type = 'multiple'
      newKeys = isSelected
      // remove if selected
        ? selectedRowKeys.filter(k => k !== key)
      // add into collection if not selected
        : [...selectedRowKeys, key]

      newRows = isSelected
        // remove if selected
        ? selectedRows.filter(item => getRowKey(item) !== key)
        // add into collection if not selected
        : [...selectedRows, record]
    }
    if (!newKeys) {
      return
    }
    setSelectedRowKeys(newKeys)
    setSelectedRows(newRows as RecordType[])

    props.rowSelection?.onChange?.(newKeys, newRows as RecordType[], { type })
  }

  const aggregator = (
    columns: TableColumn<RecordType, 'text'>[],
    field: keyof TableColumn<RecordType, 'text'>
  ) => Object.values(columns.reduce((all, column) => {
    if(column[field]) { all[column.key] = column }
    if('children' in column && column.children?.length > 0)
      column.children.forEach((child) => {
        if(child[field]) { all[child.key] = child }
      })
    return all
  }, {} as Record<string, TableColumn<RecordType, 'text'>>))

  const filterables = aggregator(columns, 'filterable')
  const searchables = aggregator(columns, 'searchable')

  const activeFilters = filterables.filter(column => {
    const key = column.filterKey || column.dataIndex as keyof RecordType
    const filteredValue = filterValues[key as keyof Filter]
    return filteredValue
  })

  const hasRowSelected = Boolean(selectedRowKeys.length)
  const hasRowActionsOffset = [
    props.rowSelection?.type
      && props.tableAlertRender !== false
      && !props.rowSelection?.alwaysShowAlert,
    filterables.length,
    searchables.length,
    groupable.length,
    iconButton
  ].some(Boolean)
  const shouldRenderHeader = props.alwaysShowFilters
    || !hasRowSelected || props.tableAlertRender === false
  const hasHeaderItems = shouldRenderHeader && (
    Boolean(filterables.length) || Boolean(searchables.length) ||
    Boolean(groupable.length) || Boolean(iconButton)
  )
  const selectAllRowSelection = {
    columnWidth: '45px',
    selections: [
      {
        key: 'SELECTION_ALL_PAGES',
        text: $t({ defaultMessage: 'Select data from all pages' }),
        onSelect: () => {
          let data = props.getAllPagesData && props.getAllPagesData()
          if(data){
            if(isGroupByActive) {
              data = data?.flatMap(item => item.children)
            }
            setSelectedRowKeys(data.map(row => getRowKey(row)))
            setSelectedRows(data)
            setAllRows(data)
          }
        }
      }
    ]
  }
  const rowSelection: TableProps<RecordType>['rowSelection'] = props.rowSelection ? {
    ...(props.getAllPagesData && selectAllRowSelection),
    ..._.omit(props.rowSelection, 'defaultSelectedRowKeys'),
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys, rows, info) => {
      setSelectedRowKeys(keys)
      const newRows = rows.findIndex(item => !item) !== -1
        ? allRows.filter(item => keys.includes(getRowKey(item))) : rows
      setSelectedRows(newRows)
      props.rowSelection?.onChange?.(keys, newRows, info)
    },
    ...isGroupByActive
      ? {
        getCheckboxProps: record => {
          return 'children' in record && !('isFirstLevel' in record)
            ? ({ disabled: true, style: { display: 'none' } })
            : props.rowSelection?.getCheckboxProps
              ? props.rowSelection?.getCheckboxProps(record)
              :({})
        }
      }
      : {}
  } : undefined

  let pagination: false | TablePaginationConfig = false
  if (type === 'tall') {
    pagination = { ...defaultPagination, ...props.pagination || {} } as TablePaginationConfig
    if (((pagination.total || dataSource?.length) || 0) <= pagination.defaultPageSize!) {
      pagination = false
    }
  }

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
          width: colWidth[column.key],
          definedWidth: col.width
        })
      })
      : col

  const columnRender = (col: ColumnType<RecordType> | ColumnGroupType<RecordType, 'text'>) => ({
    ...col,
    show: columnsState.value[col.key]?.show,
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
    ...('children' in column && {
      children: column.children?.map(child => _.flow([columnRender, columnResize])(child))
    })
  }))

  const headerItems = hasHeaderItems ? <>
    <div>
      <Space size={12}>
        {Boolean(searchables.length) &&
          renderSearch<RecordType>(
            intl, searchables, searchValue, setSearchValue, searchWidth
          )}
        {filterables.map((column, i) =>
          renderFilter<RecordType>(
            column, i, dataSource, filterValues,
            setFilterValues, !!enableApiFilter, filterWidth)
        )}
        {Boolean(groupable.length) && <GroupSelect<RecordType>
          $t={$t}
          groupable={groupable}
          setValue={setGroupByValue}
          value={groupByValue}
          style={{ width: filterWidth }}
        />}
      </Space>
    </div>
    <UI.HeaderComps>
      {(
        Boolean(activeFilters.length) ||
        (Boolean(searchValue) && searchValue.length >= MIN_SEARCH_LENGTH) ||
        isGroupByActive)
        && <Button
          style={props.floatRightFilters ? { marginLeft: '12px' } : {}}
          onClick={() => {
            setFilterValues({} as Filter)
            setSearchValue('')
            setGroupByValue(undefined)
          }}>
          {$t({ defaultMessage: 'Clear Filters' })}
        </Button>}
      { type === 'tall' && iconButton && <IconButton {...iconButton}/> }
    </UI.HeaderComps>
  </> : null

  let offsetHeader = layout.pageHeaderY
  if (props.actions?.length) offsetHeader += 22
  if (hasRowActionsOffset) offsetHeader += 36
  const sticky = type === 'tall' &&
    // disable in test env as it will result in 2 tables rendered
    // this is to prevent confusing/inconvenience for implementor
    // to find out themselves when they are using Table and
    // expect single table to be rendered
    process.env.NODE_ENV !== 'test'
    ? { offsetHeader } : undefined

  return <UI.Wrapper
    style={{
      ...(style ?? {}),
      '--sticky-offset': `${layout.pageHeaderY}px`,
      '--sticky-has-actions': props.actions?.length ? '1' : '0',
      '--sticky-has-row-actions-offset': hasRowActionsOffset ? '1' : '0'
    } as React.CSSProperties}
    $type={type}
  >
    <UI.TableSettingsGlobalOverride />
    {props.actions && <UI.ActionsContainer
      size={0}
      split={<UI.Divider type='vertical' />}>
      {props.actions?.map((action, index) => {
        const props: ButtonProps & { key: React.Key } = {
          key: action.key ?? `action-${index}`,
          type: 'link',
          size: 'small',
          children: action.label
        }
        const content = !action.disabled
          ? <Button {...props} onClick={action.dropdownMenu ? undefined : action.onClick} />
          : <DisabledButton {...props} title={action.tooltip || ''} />
        return action.dropdownMenu
          ? <Dropdown
            key={`dropdown-${index}`}
            overlay={<Menu {...action.dropdownMenu} />}
            disabled={action.disabled}>
            {() => content }
          </Dropdown>
          : content
      })}
    </UI.ActionsContainer>}
    {hasRowActionsOffset && shouldRenderHeader && <UI.Header
      style={props.floatRightFilters ? { justifyContent: 'flex-end' } : {}}
      children={headerItems}
    />}
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
        onChange: (state: TableColumnState) => columnsState.onChange(state)
      }}
      sticky={sticky}
      scroll={{
        x: type !== 'tall' ? '100%' : finalColumns.reduce(scrollXReducer, settingsKeyWidth)
      }}
      rowSelection={rowSelection}
      pagination={pagination}
      columnEmptyText={false}
      onRow={onRow}
      showSorterTooltip={false}
      tableAlertOptionRender={false}
      expandable={expandable}
      onExpand={isGroupByActive ? onExpand : undefined}
      rowClassName={props.rowClassName
        ? props.rowClassName
        : (record) => isGroupByActive && 'children' in record && !('isFirstLevel' in record)
          ? 'parent-row-data'
          : ''
      }
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
              const rows = enableApiFilter
                ? selectedRows
                : selectedRows.map(row => {
                  const tmp = { ...row }
                  if(tmp.hasOwnProperty('children') && !tmp.children) {
                  // remove children from getFilteredData
                    delete tmp.children
                  }
                  return tmp
                })

              const visible = typeof option.visible === 'function'
                ? option.visible(rows)
                : option.visible ?? true
              if (!visible) return null

              const tooltip = typeof option.tooltip === 'function'
                ? option.tooltip(rows)
                : option.tooltip
              const label = tooltip
                ? <Tooltip placement='top' title={tooltip}>{option.label}</Tooltip>
                : option.label
              const disabled = typeof option.disabled === 'function'
                ? option.disabled(rows)
                : option.disabled
              const buttonProps: ButtonProps & { key: React.Key } = {
                type: 'link',
                size: 'small',
                key: option.key ?? option.label
              }

              if (disabled && tooltip) return <DisabledButton {...buttonProps} title={tooltip}>
                {option.label}
              </DisabledButton>

              return <Button
                {...buttonProps}
                disabled={disabled}
                onClick={() =>
                  option.onClick(rows, () => { onCleanSelected() })
                }
              >
                {label}
              </Button>
            })}
          </Space>
        </Space>
      ))}
    />
  </UI.Wrapper>
}

Table.SubTitle = UI.SubTitle
Table.Highlighter = UI.Highlighter

export { Table }

type ScrollXReducerColumn = {
  key: string
  width: number
  show: boolean
}

/**
 * Compute scrollX of the table
 *
 * @param {number} scrollX - aggregated scrollX
 * @param {ScrollXReducerColumn & { children?: ScrollXReducerColumn[] }} col - the column being evaluated
 * @return {number} scrollX of the table
 */
function scrollXReducer (
  scrollX: number,
  col: ScrollXReducerColumn & { children?: ScrollXReducerColumn[] }
): number {
  // `col.show` is true by default
  if (col.show === false) return scrollX
  if (col.children) return col.children.reduce(scrollXReducer, scrollX)
  const width = Number.isFinite(col.width)
    ? col.width
    // multiply col with Infinity by 2
    : defaultColumnWidth * (Number(col.width === Infinity))
  return scrollX + width
}
