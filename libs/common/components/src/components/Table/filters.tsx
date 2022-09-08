import React from 'react'

import { Select, Input } from 'antd'
import { IntlShape }     from 'react-intl'

import type { TableColumn, RecordWithChildren } from './types'

export interface FilterValue {
  key: string[]
}
export function getFilteredData <RecordType> (
  dataSource: readonly RecordType[] | undefined,
  filterValues: FilterValue,
  activeFilters: TableColumn<RecordType, 'text'>[],
  searchables: TableColumn<RecordType, 'text'>[],
  searchValue: string
): RecordType[] | undefined {
  const deepDataCopy = dataSource?.map(val => ({ ...val })) as Array<RecordType & {
    children?: RecordType[]
  }>
  return (deepDataCopy) && deepDataCopy.filter(
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
}
export function renderSearch <RecordType> (
  intl: IntlShape,
  searchables: TableColumn<RecordType, 'text'>[],
  searchValue: string,
  setSearchValue: Function
): React.ReactNode {
  return <Input
    onChange={e => setSearchValue(e.target.value)}
    placeholder={intl.$t({ defaultMessage: 'Search {searchables}' }, {
      searchables: searchables.map(column => column.title).join(', ')
    })}
    style={{ width: 292 }}
    value={searchValue}
  />
}
export function renderFilter <RecordType> (
  column: TableColumn<RecordType, 'text'>,
  index: number,
  dataSource: readonly RecordType[] | undefined,
  filterValues: FilterValue,
  setFilterValues: Function
): React.ReactNode {
  const key = column.dataIndex as keyof RecordType
  const addToFilter = (data: string[], value: string) => {
    if (!data.includes(value)) {
      data.push(value)
    }
  }
  return <Select
    data-testid='options-selector'
    key={index}
    maxTagCount='responsive'
    mode='multiple'
    value={filterValues[key as keyof FilterValue]}
    onChange={value => setFilterValues({ ...filterValues, [key]: value.length ? value: undefined })}
    placeholder={column.title as string}
    showArrow
    style={{ width: 200 }}
  >
    {dataSource
      ?.reduce((data: string[], datum: RecordWithChildren<RecordType>) => {
        const { children } = datum
        if (children) {
          for (const child of children) {
            addToFilter(data, child[key] as unknown as string)
          }
        }
        addToFilter(data, datum[key] as unknown as string)
        return data
      }, [])
      .sort()
      .map(value =>
        <Select.Option value={value} key={value} data-testid={`option-${value}`} >
          {value}
        </Select.Option>
      )
    }
  </Select>
}
