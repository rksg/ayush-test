import { Select }     from 'antd'
import {
  BaseOptionType,
  DefaultOptionType
} from 'antd/lib/select'
import { FilterValue } from 'antd/lib/table/interface'
import { IntlShape }   from 'react-intl'

import * as UI from './styledComponents'

import type { TableColumn, RecordWithChildren } from './types'

export interface Filter extends Record<string, FilterValue|null> {}

export const MIN_SEARCH_LENGTH = 2

function hasChildrenColumn <RecordType> (
  column: RecordType | RecordWithChildren<RecordType>
): column is RecordWithChildren<RecordType> {
  return !!(column as RecordWithChildren<RecordType>).children
}

export function getFilteredData <RecordType> (
  dataSource: readonly (RecordType | RecordWithChildren<RecordType>)[] | undefined,
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
          ?.toString()
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
  setSearchValue: Function,
  width: number
): React.ReactNode {
  const placeHolderText = intl.$t({ defaultMessage: 'Search {searchables}' }, {
    searchables: searchables.map(column => column.title).join(', ')
  })
  return <UI.SearchInput
    onChange={e => setSearchValue(e.target.value)}
    placeholder={placeHolderText}
    title={placeHolderText}
    style={{ width }}
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
  enableApiFilter: boolean,
  width: number
) {
  const key = (column.filterKey || column.dataIndex) as keyof RecordType
  const addToFilter = (data: string[], value: string) => {
    if (typeof value !== 'undefined' && !data.includes(value)) {
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
      }, []).sort().map(v => ({ key: v, value: v, label: v }))
      : []

  return <UI.FilterSelect
    data-testid='options-selector'
    key={index}
    maxTagCount='responsive'
    mode={column.filterMultiple === false ? undefined : 'multiple'}
    showSearch={column?.filterSearchable ?? undefined}
    value={filterValues[key as keyof Filter]}
    onChange={(value: unknown) => {
      const isValidValue = Array.isArray(value) ? (value as string[]).length : value
      const filterValue = Array.isArray(value) ? value : [value]
      let filters = {} as Filter

      if (column.filterValueNullable === false &&
        filterValue.filter(v => v != null).length === 0) {
        filters = { ...filterValues, [key]: undefined } as Filter
      } else {
        filters = { ...filterValues, [key]: isValidValue ? filterValue : undefined } as Filter
      }

      column?.coordinatedKeys?.forEach(key => {
        delete filters[key]
      })

      setFilterValues(filters)
    }}
    filterOption={filterOption}
    placeholder={column.title as string}
    showArrow
    allowClear
    style={{ width }}
  >
    {options?.map((option, index) =>
      <Select.Option
        value={option.key}
        key={option.key ?? index}
        data-testid={`option-${option.key}`}
        title={option.value}
        children={option.label ?? option.value}
      />
    )}
  </UI.FilterSelect>
}

export function filterOption (
  input: string,
  option: DefaultOptionType | BaseOptionType | undefined
) {
  return option?.title?.toLowerCase().includes(input.toLowerCase())
}
