import React from 'react'

import { Select }      from 'antd'
import { FilterValue } from 'antd/lib/table/interface'
import { IntlShape }   from 'react-intl'

import { CollapseActive, CollapseInactive } from '@acx-ui/icons'

import * as UI from './styledComponents'

import { TableProps } from '.'

import type { TableColumn, RecordWithChildren } from './types'

export interface Filter extends Record<string, FilterValue|null> {}

export const MIN_SEARCH_LENGTH = 2

function hasChildrenColumn <RecordType> (
  column: RecordType | RecordWithChildren<RecordType>
): column is RecordWithChildren<RecordType> {
  return !!(column as RecordWithChildren<RecordType>).children
}

export function getFilteredData <RecordType> (
  dataSource: readonly (RecordType|RecordWithChildren<RecordType>)[] | undefined,
  filterValues: Filter,
  activeFilters: TableColumn<RecordType, 'text'>[],
  searchables: TableColumn<RecordType, 'text'>[],
  searchValue: string
): RecordType[] | undefined {
  const isRowMatching = (row: RecordType): Boolean => {
    for (const column of activeFilters) {
      const key = column.dataIndex as keyof RecordType
      const filteredValue = filterValues[key as keyof Filter]!
      if (!filteredValue.includes(row[key] as unknown as string)) {
        return false
      }
    }
    if (searchValue && searchValue.length >= MIN_SEARCH_LENGTH) {
      return searchables.some(column => {
        const target = row[column.dataIndex as keyof RecordType]
        return typeof target === 'string' && target
          .toString()
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      })
    }
    return true
  }
  const typedData = Array.isArray(dataSource) ? dataSource : []
  return typedData.reduce((
    rows: RecordWithChildren<RecordType>[],
    row: RecordType | RecordWithChildren<RecordType>
  ) => {
    const children = hasChildrenColumn(row) ? row.children?.filter(isRowMatching) : undefined
    if (children?.length) {
      rows.push({ ...row, children })
    } else if (isRowMatching(row)) {
      rows.push({ ...row, children: undefined })
    }
    return rows
  }, [] as RecordWithChildren<RecordType>[])
}
export function renderSearch <RecordType> (
  intl: IntlShape,
  searchables: TableColumn<RecordType, 'text'>[],
  searchValue: string,
  setSearchValue: Function
): React.ReactNode {
  return <UI.SearchInput
    onChange={e => setSearchValue(e.target.value)}
    placeholder={intl.$t({ defaultMessage: 'Search {searchables}' }, {
      searchables: searchables.map(column => column.title).join(', ')
    })}
    style={{ width: 292 }}
    value={searchValue}
    allowClear
  />
}
export function renderFilter <RecordType> (
  column: TableColumn<RecordType, 'text'>,
  index: number,
  dataSource: readonly RecordType[] | undefined,
  filterValues: Filter,
  setFilterValues: Function,
  enableApiFilter: boolean
): React.ReactNode {
  const key = (column.filterKey || column.dataIndex) as keyof RecordType
  const addToFilter = (data: string[], value: string) => {
    if (!data.includes(value)) {
      data.push(value)
    }
  }
  const typedData: readonly RecordType[] = Array.isArray(dataSource) ? dataSource : []
  const options = Array.isArray(column.filterable)
    ? column.filterable
    : !enableApiFilter
      ? typedData.reduce((data: string[], datum: RecordType) => {
        const { children } = hasChildrenColumn(datum) ? datum : { children: undefined }
        if (children) {
          for (const child of children) {
            addToFilter(data, child[key] as unknown as string)
          }
        }
        addToFilter(data, datum[key] as unknown as string)
        return data
      }, []).sort().map(v => ({ key: v, value: v }))
      : []

  return <UI.FilterSelect
    data-testid='options-selector'
    key={index}
    maxTagCount='responsive'
    mode={column.filterMultiple === false ? undefined : 'multiple'}
    value={filterValues[key as keyof Filter]}
    onChange={(value: unknown) => {
      const isValidValue = Array.isArray(value) ? (value as string[]).length : value
      const filterValue = Array.isArray(value) ? value : [value]
      if (column.filterValueNullable === false &&
        filterValue.filter(v => v != null).length === 0) {
        setFilterValues({ ...filterValues, [key]: undefined })
      } else {
        setFilterValues({ ...filterValues, [key]: isValidValue ? filterValue : undefined })
      }
    }}
    placeholder={column.title as string}
    showArrow
    allowClear
    style={{ width: 200 }}
  >
    {options?.map(option =>
      <Select.Option value={option.key} key={option.key} data-testid={`option-${option.key}`} >
        {option.value}
      </Select.Option>
    )}
  </UI.FilterSelect>
}

export function useGroupBy<RecordType> (
  groupables: TableProps<RecordType>['columns'],
  tableActions: TableProps<RecordType>['groupByTableActions'],
  colLength: number,
  intl: IntlShape
) {
  const [value, setValue] = React.useState<{ key: string, value: string } | undefined>(undefined)

  const { $t } = intl

  if (Array.isArray(groupables) && groupables.length > 0) {
    const getChildren = (record: RecordType) =>
      (record as unknown as { children: RecordType[] | undefined }).children

    const hasValidChildren = (record: RecordType) => {
      const children = getChildren(record)
      return Boolean(children) && Array.isArray(children) && children.length > 0
    }

    const checkParent = (record: RecordType) => {
      const { isParent } = (record as unknown as { isParent: boolean })
      return isParent
    }

    const { onChange, onClear } = tableActions ?? {}
    const currentKey = value?.key ?? ' '

    const validGroupables = groupables.filter(cols => Boolean(cols.groupable))
    const selectors = validGroupables.map(col => col.groupable!)
    const GroupBySelect = () => {
      return <UI.FilterSelect
        placeholder={$t({ defaultMessage: 'Group By...' })}
        allowClear
        showArrow
        value={value}
        onChange={(val, options) => {
          if (!val) return
          onChange && onChange(val)
          const { key, children } = options as { key: string, children: string }
          const option = { key, value: children }
          setValue(option)
        }}
        onClear={() => {
          onClear && onClear()
          setValue(undefined)
        }}
        key='select-group-by'
        data-testid='select-group-by'
      >
        {selectors.map((item) => <Select.Option
          key={item.key}
          value={item.key}
          data-testid={`option-${item.key}`}
        >
          {item.label}
        </Select.Option>)}
      </UI.FilterSelect>
    }

    const clearGroupByFn = () => {
      onClear && onClear()
      setValue(undefined)
    }

    const isGroupByActive = Boolean(value)

    const targetCol = groupables.find(col => col.key === currentKey)
    const actionsList = targetCol?.groupable!.actions ?? []
    const groupActionColumns: TableProps<RecordType>['columns'] = actionsList
      .map((val) => ({
        key: val.key,
        dataIndex: '',
        render: (_, record) => {
          return checkParent(record)
            ? <div onClick={() => val.callback && val.callback(record)}>
              {val.label}
            </div>
            : null
        }
      }))

    const expandable: TableProps<RecordType>['expandable'] = {
      expandIconColumnIndex: colLength + groupActionColumns.length,
      rowExpandable: (record) => hasValidChildren(record),
      expandIcon: (props) => {
        if (!hasValidChildren(props.record)) return null
        const ExpandIcon = ({ isActive }: { isActive: boolean }) => (isActive)
          ? <CollapseInactive />
          : <CollapseActive />
        const WrappedExpand = () => <UI.ExpandWrapper
          onClick={(e) => props.onExpand(props.record, e)}>
          <ExpandIcon isActive={props.expanded}/>
        </UI.ExpandWrapper>
        return <WrappedExpand />
      }
    }

    const finalParentColumns = targetCol?.groupable!.parentColumns

    return {
      GroupBySelect,
      expandable,
      groupActionColumns,
      finalParentColumns,
      clearGroupByFn,
      isGroupByActive
    }
  }

  return {
    GroupBySelect: () => null,
    expandable: undefined,
    groupActionColumns: [],
    finalParentColumns: [],
    clearGroupByFn: () => {},
    isGroupByActive: false
  }
}
