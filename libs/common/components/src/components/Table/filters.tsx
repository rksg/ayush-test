import React from 'react'

import { Select, Input } from 'antd'
import { uniq }          from 'lodash'
import { IntlShape }     from 'react-intl'

import type { TableColumn } from './types'

export interface FilterValue {
  key: string[]
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
  return <Select
    data-testid='options-selector'
    key={index}
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
    {uniq(dataSource?.map((datum: RecordType) => {
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
}
