import React, { useMemo, useState, Key, useCallback, useEffect } from 'react'

import ProTable, { ProTableProps as ProAntTableProps } from '@ant-design/pro-table'
import { Space, Divider, Button, Select, Input }       from 'antd'
import _                                               from 'lodash'
import Highlighter                                     from 'react-highlight-words'
import { useIntl }                                     from 'react-intl'

import { SettingsOutlined } from '@acx-ui/icons'

import * as UI                          from './styledComponents'
import { settingsKey, useColumnsState } from './useColumnsState'

import type { TableColumn, ColumnStateOption } from './types'
import type { ParamsType }                     from '@ant-design/pro-provider'
import type { SettingOptionType }              from '@ant-design/pro-table/lib/components/ToolBar'
import type {
  TableProps as AntTableProps,
  TablePaginationConfig
} from 'antd'

export type {
  ColumnType,
  ColumnGroupType,
  TableColumn
} from './types'

export interface TableProps <RecordType>
  extends Omit<ProAntTableProps<RecordType, ParamsType>,
  'bordered' | 'columns' | 'title' | 'type' | 'rowSelection'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip'
    rowKey?: Exclude<ProAntTableProps<RecordType, ParamsType>['rowKey'], Function>
    columns: TableColumn<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
    }>
    columnState?: ColumnStateOption
    rowSelection?: (ProAntTableProps<RecordType, ParamsType>['rowSelection'] 
      & AntTableProps<RecordType>['rowSelection']
      & {
      alwaysShowAlert?: boolean;
  })
  }

interface FilterValue {
  key: string[]
}

const defaultPagination = {
  mini: true,
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 25, 50, 100],
  position: ['bottomCenter'],
  showTotal: false
} as const

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
  const { $t } = useIntl()
  const [filterValues, setFilterValues] = useState<FilterValue>({} as FilterValue)
  const [searchValue, setSearchValue] = useState<string>('')
  const { dataSource } = props

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

    const key = record[rowKey] as unknown as Key
    const isSelected = selectedRowKeys.includes(key)

    if (props.rowSelection.type === 'radio') {
      if (!isSelected) {
        setSelectedRowKeys([key])
      }
    } else {
      setSelectedRowKeys(isSelected
        // remove if selected
        ? selectedRowKeys.filter(k => k !== key)
        // add into collection if not selected
        : [...selectedRowKeys, key])
    }
  }
  columns = columns.map(column => column.searchable && searchValue
    ? {
      ...column,
      render: (_, value) => <Highlighter
        highlightStyle={{
          fontWeight: 'bold',
          background: 'none',
          padding: 0
        }}
        searchWords={[searchValue]}
        autoEscape
        textToHighlight={value[column.dataIndex as keyof RecordType]}
      />
    }
    : column
  )

  const filterables = columns.filter(column => column.filterable)
  const searchables = columns.filter(column => column.searchable)
  const activeFilters = filterables.filter(column => {
    const key = column.dataIndex as keyof RecordType
    const filteredValue = filterValues[key as keyof FilterValue]

    return filteredValue
  })
  const deepDataCopy = dataSource?.map(val => ({ ...val })) as Array<RecordType & {
    children?: RecordType[]
  }>
  const filteredData = (deepDataCopy) && deepDataCopy.filter(
    (row) => {
      for (const column of activeFilters) {
        const key = column.dataIndex as keyof RecordType
        const filteredValue = filterValues[key as keyof FilterValue]
        const filterHelper = (val: typeof row, filterKey: keyof typeof row) =>
          filteredValue.includes(val[filterKey] as unknown as string)

        const childValues = row.children && row.children.filter((child) => filterHelper(child, key))
        
        if (childValues && childValues.length > 0) {
          return true
        }
        row.children = undefined
        if (!filterHelper(row, key)) {
          return false
        }
      }

      if (searchValue) {
        return searchables.some(column => {
          const key = column.dataIndex as keyof RecordType
          const { children } = row
          const matchHelper = (val: typeof row, key: keyof typeof row, searchValue: string) => 
            (val[key] as unknown as string)
              .toString()
              .toLowerCase()
              .includes(searchValue.toLowerCase())

          row.children = children 
            && children.filter((child) => matchHelper(child, key, searchValue))

          if (row.children && row.children.length > 0) {
            return true
          }
          // parent rows with no matching children, search parent
          row.children = undefined
          return matchHelper(row, key, searchValue)
        })
      }
      return true
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

  return <UI.Wrapper
    $type={type}
    $rowSelectionActive={Boolean(props.rowSelection) && !hasHeader}
  >
    {hasHeader && (
      <UI.Header>
        {Boolean(searchables.length) && <Input
          onChange={e => setSearchValue(e.target.value)}
          placeholder={$t({ defaultMessage: 'Search {searchables}' }, {
            searchables: searchables.map(column => column.title).join(', ')
          })}
          style={{ width: 292 }}
          value={searchValue}
        />}
        {filterables.map((column, i) => {
          const key = column.dataIndex as keyof RecordType
          return <Select
            data-testid='options-selector'
            key={i}
            maxTagCount='responsive'
            mode='multiple'
            value={filterValues[key as keyof FilterValue]}
            onChange={value => {
              const uncheckedFilters = { ...filterValues, [key]: value }
              const checkFilter = {} as FilterValue
              for (const property in uncheckedFilters) {
                if (uncheckedFilters[property as keyof FilterValue] 
                  && uncheckedFilters[property as keyof FilterValue].length > 0) {
                  checkFilter[property as keyof FilterValue] = 
                      uncheckedFilters[property as keyof FilterValue]
                }
              }
              setFilterValues(checkFilter)
            }}
            placeholder={column.title as string}
            showArrow
            style={{ width: 200 }}
          >
            {_.uniq(dataSource?.map((datum: RecordType) => {
              const children = datum['children'] as RecordType[] | undefined
              const validChildren = children 
                && children.map((child) => child[key] as unknown as string)

              if (!validChildren) return [datum[key] as unknown as string]

              const raw = [
                ...validChildren,
                datum[key] as unknown as string
              ]

              return raw.filter(Boolean)
            })
              .flat())
              .sort()
              .map(value =>
                <Select.Option value={value} key={value} data-testid={`option-${value}`} >
                  {value}
                </Select.Option>
              )}
          </Select>
        })}
        {(Boolean(activeFilters.length) || Boolean(searchValue)) && <UI.ClearButton
          onClick={() => {
            setFilterValues({} as FilterValue)
            setSearchValue('')
          }}
        >
          {$t({ defaultMessage: 'Clear Filters' })}
        </UI.ClearButton>}
      </UI.Header>
    )}
    <UI.TableSettingsGlobalOverride />
    <ProTable<RecordType>
      {...props}
      dataSource={filteredData}
      bordered={false}
      search={false}
      columns={columns}
      options={{ setting, reload: false, density: false }}
      columnsState={columnsState}
      scroll={props.scroll ? props.scroll : { x: 'max-content' }}
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
            />
          </Space>
          <Space size={0} split={<Divider type='vertical' />}>
            {props.actions?.map((option) =>
              <UI.ActionButton
                key={option.label}
                onClick={() =>
                  option.onClick(getSelectedRows(selectedRowKeys), () => { onCleanSelected() })}
                children={option.label}
              />
            )}
          </Space>
        </Space>
      )}
    />
  </UI.Wrapper>
}

Table.SubTitle = UI.SubTitle

export { Table }
