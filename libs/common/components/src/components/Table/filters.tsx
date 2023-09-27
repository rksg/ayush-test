import React, { useState } from 'react'

import { Checkbox, Select, DatePicker } from 'antd'
import { CheckboxChangeEvent }          from 'antd/lib/checkbox'
import {
  BaseOptionType,
  DefaultOptionType
} from 'antd/lib/select'
import { FilterValue }        from 'antd/lib/table/interface'
import { IntlShape, useIntl } from 'react-intl'

import {
  DateRange,
  dateRangeMap,
  defaultRanges
} from '@acx-ui/utils'

import * as UI from './styledComponents'

import type { TableColumn, RecordWithChildren } from './types'
const { RangePicker } = DatePicker

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
  const renderCheckbox = (column: TableColumn<RecordType, 'text'>) => {
    return <Checkbox
      key={index}
      defaultChecked={(column?.defaultFilteredValue &&
        column?.defaultFilteredValue[0] as boolean) || false}
      onChange={(e: CheckboxChangeEvent) => {
        const isChecked = e.target.checked.toString() ||
          (column?.defaultFilteredValue && column?.defaultFilteredValue[0])
        if (column.filterValueNullable === false) {
          setFilterValues({ ...filterValues, [key]: undefined })
        } else {
          setFilterValues({ ...filterValues, [key]: [isChecked] })
        }
      }}>{column?.filterComponent?.label}</Checkbox>
  }

  const DatepickerComp = (column: TableColumn<RecordType, 'text'>, intl: IntlShape) => {

    const [option, setOption] = useState('')
    const timeRange = () => [
      { key: '', text: intl.$t(dateRangeMap[DateRange.allTime]) },
      { key: DateRange.last24Hours, text: intl.$t(dateRangeMap[DateRange.last24Hours]) },
      { key: DateRange.last7Days, text: intl.$t(dateRangeMap[DateRange.last7Days]) },
      { key: DateRange.last30Days, text: intl.$t(dateRangeMap[DateRange.last30Days]) },
      { key: DateRange.custom, text: intl.$t(dateRangeMap[DateRange.custom]) }
    ] as Array<{ key: string, text: string }>

    const showtimeRangeOptions = timeRange().map(({ key, text }) => ({
      key, value: text
    }))
    return <>
      <UI.FilterSelect
        key={index}
        maxTagCount='responsive'
        mode={column.filterMultiple === false ? undefined : 'multiple'}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(value: any) => {
          setOption(value)
          const ranges = defaultRanges()
          const range = ranges[value as DateRange]
          const result = {
            fromTime: range?.[0] ?? undefined,
            toTime: range?.[1] ?? undefined
          }
          setFilterValues({ ...filterValues, ...result })
        }}
        filterOption={filterOption}
        placeholder={column.title as string}
        showArrow
        allowClear
        style={{ width }}
      >
        {showtimeRangeOptions?.map((option, index) =>
          <Select.Option
            value={option.key}
            key={option.key ?? index}
            data-testid={`option-${option.key}`}
            title={option.value}
            children={option.value}
          />
        )}
      </UI.FilterSelect>
      {option === DateRange.custom &&
      <RangePicker
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(value: any) => {
          const result = {
            fromTime: value?.[0] ?? undefined,
            toTime: value?.[1] ?? undefined
          }
          setFilterValues({ ...filterValues, ...result })
        }}
        style={{ width: '220px' }}
      />}
    </>
  }

  const filterTypeComp = {
    checkbox: renderCheckbox(column),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    datepicker: DatepickerComp(column, useIntl())
  }
  type Type = keyof typeof filterTypeComp


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


  return filterTypeComp[column.filterComponent?.type as Type] ||
    <UI.FilterSelect
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
