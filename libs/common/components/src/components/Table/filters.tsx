import React from 'react'

import { Select }    from 'antd'
import { IntlShape } from 'react-intl'

import { CloseSymbol } from '@acx-ui/icons'

import * as UI from './styledComponents'


import type { TableColumn, RecordWithChildren } from './types'

type Record<RecordType> = RecordWithChildren<RecordType>

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

  return dataSource?.reduce((rows, row) => {
    const children = (row as Record<RecordType>).children?.filter(isRowMatching)
    if (children?.length) {
      rows.push({ ...row, children })
    } else if (isRowMatching(row)) {
      rows.push({ ...row, children: undefined })
    }
    return rows
  }, [] as Record<RecordType>[])
}
export function RenderSearch <RecordType> (
  intl: IntlShape,
  searchables: TableColumn<RecordType, 'text'>[],
  searchValue: string,
  setSearchValue: Function
) {
  return (<UI.SearchInput
    onChange={e => setSearchValue(e.target.value)}
    placeholder={intl.$t({ defaultMessage: 'Search {searchables}' }, {
      searchables: searchables.map(column => column.title).join(', ')
    })}
    style={{ width: 292 }}
    value={searchValue}
    allowClear={{ clearIcon: <CloseSymbol /> }}
  />)
}
export function RenderFilter <RecordType> (
  column: TableColumn<RecordType, 'text'>,
  index: number,
  dataSource: readonly RecordType[] | undefined,
  filterValues: FilterValue,
  setFilterValues: Function
) {
  const key = column.dataIndex as keyof RecordType
  const addToFilter = (data: string[], value: string) => {
    if (!data.includes(value)) {
      data.push(value)
    }
  }
  return (<UI.FilterSelect
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
      ?.reduce((data, datum) => {
        const { children } = datum as Record<RecordType>
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
  </UI.FilterSelect>)
}
