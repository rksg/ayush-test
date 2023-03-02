import React from 'react'

import { Select }      from 'antd'
import { FilterValue } from 'antd/lib/table/interface'
import { IntlShape }   from 'react-intl'

import * as UI from './styledComponents'

import type { TableColumn, RecordWithChildren } from './types'

export interface Filter extends Record<string, FilterValue|null> {}

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
    if (searchValue) {
      return searchables.some(column => {
        return (row[column.dataIndex as keyof RecordType] as unknown as string)
          .toString()
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      })
    }
    return true
  }
  return dataSource?.reduce((
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

  const options = Array.isArray(column.filterable)
    ? column.filterable
    : !enableApiFilter
      ? dataSource?.reduce((data: string[], datum: RecordType) => {
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

export function renderGroupBy<RecordType> (
  groupables: TableColumn<RecordType, 'text'>[]
) {
  return <UI.FilterSelect
    placeholder='Group By...'
    allowClear
    onChange={() => groupables[1]?.groupable && groupables[1]?.groupable()}
  >
    {groupables.map(col => <Select.Option
      key={col.key}
      data-testid={`option-${col.key}`}
    >
      {col.title as string}
    </Select.Option>)}
  </UI.FilterSelect>
}
