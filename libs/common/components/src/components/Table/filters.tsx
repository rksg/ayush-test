import React from 'react'

import { Select }    from 'antd'
import { IntlShape } from 'react-intl'

import { SearchOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

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
  const isRowMatching = (row: RecordType): Boolean => {
    for (const column of activeFilters) {
      const key = column.dataIndex as keyof RecordType
      const filteredValue = filterValues[key as keyof FilterValue]
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
  type Record = RecordWithChildren<RecordType>
  return dataSource?.reduce((rows: Record[], row: Record) => {
    const children = row.children?.filter(isRowMatching)
    if (children?.length) {
      rows.push({ ...row, children })
    } else if (isRowMatching(row)) {
      rows.push({ ...row, children: undefined })
    }
    return rows
  }, [] as Record[])
}
export function renderSearch <RecordType> (
  intl: IntlShape,
  searchables: TableColumn<RecordType, 'text'>[],
  searchValue: string,
  setSearchValue: Function
): React.ReactNode {
  return <UI.SearchInput
    prefix={<SearchOutlined />}
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
  filterValues: FilterValue,
  setFilterValues: Function
): React.ReactNode {
  const key = column.dataIndex as keyof RecordType
  const addToFilter = (data: string[], value: string) => {
    if (!data.includes(value)) {
      data.push(value)
    }
  }
  return <UI.FilterSelect
    data-testid='options-selector'
    key={index}
    maxTagCount='responsive'
    mode='multiple'
    value={filterValues[key as keyof FilterValue]}
    onChange={(value: unknown) =>
      setFilterValues({ ...filterValues, [key]: (value as string[]).length ? value: undefined })
    }
    placeholder={column.title as string}
    showArrow
    allowClear
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
  </UI.FilterSelect>
}
