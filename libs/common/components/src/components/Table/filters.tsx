import React from 'react'

import { Checkbox, Select }    from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import {
  BaseOptionType,
  DefaultOptionType
} from 'antd/lib/select'
import { FilterValue } from 'antd/lib/table/interface'
import _               from 'lodash'
import moment          from 'moment'
import { IntlShape }   from 'react-intl'

import { Features, useIsSplitOn }                                   from '@acx-ui/feature-toggle'
import { DateFilter, DateRange, getDateRangeFilter, useDateFilter } from '@acx-ui/utils'

import { getDefaultEarliestStart, RangePicker } from '../DatePicker'

import * as UI from './styledComponents'

import type { TableColumn, RecordWithChildren } from './types'

export interface Filter extends Record<string, FilterValue|null> {}

export const MIN_SEARCH_LENGTH = 2

function hasChildrenColumn <RecordType> (
  column: RecordType | RecordWithChildren<RecordType>
): column is RecordWithChildren<RecordType> {
  return !!(column as RecordWithChildren<RecordType>).children
}

interface RangePickerProps {
  filterValues: Filter,
  setFilterValues: Function,
  settingsId?: string,
  filterPersistence?: boolean
}

function RangePickerComp (props: RangePickerProps) {
  const isDateRangeLimit = useIsSplitOn(Features.ACX_UI_DATE_RANGE_LIMIT)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { filterValues, setFilterValues, settingsId, filterPersistence } = props
  const { startDate, endDate, setDateFilter, range } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })
  return <UI.FilterRangePicker>
    <RangePicker
      selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
      onDateApply={(date: DateFilter) => {
        const period = getDateRangeFilter(date.range, date.startDate, date.endDate)
        const filters = {
          ...filterValues,
          ...(date.range === DateRange.allTime ?
            { fromTime: undefined, toTime: undefined } :
            { fromTime: moment(period.startDate).toISOString(),
              toTime: moment(period.endDate).toISOString() })
        }
        if(filterPersistence){
          sessionStorage.setItem(`${settingsId}-filter`, JSON.stringify(filters))
        }
        setFilterValues(filters)
        setDateFilter(date)
      }}
      selectionType={filterValues['fromTime'] === undefined ? DateRange.allTime : range}
      maxMonthRange={isDateRangeLimit ? 1 : 3}
      showAllTime
    />
  </UI.FilterRangePicker>
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
      const key = (column.filterKey || column.dataIndex) as keyof RecordType
      const filteredValue = filterValues[key as keyof Filter]!
      if (!filteredValue.includes(_.get(row, key) as unknown as string)) {
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
  width: number,
  customPlaceHolder?: string
): React.ReactNode {

  const getColumnTitle = (column: TableColumn<RecordType, 'text'>): string => {
    if (typeof column?.title === 'string') {
      return column.title
    } else if (typeof column === 'string') {
      return column
    }

    const columnTitle = (column?.title || column) as React.ReactElement
    if (columnTitle?.props?.children) {
      return getColumnTitle(Array.isArray(columnTitle.props.children)
        ? columnTitle.props.children[0] : columnTitle.props.children)
    }

    return ''
  }
  const placeHolderText = customPlaceHolder || intl.$t({ defaultMessage: 'Search {searchables}' }, {
    searchables: searchables.map(column => getColumnTitle(column)).join(', ')
  })
  return <UI.SearchInput
    onChange={e => setSearchValue(e.target.value)}
    placeholder={placeHolderText}
    title={placeHolderText}
    style={{ width }}
    maxLength={64}
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
  width: number,
  settingsId?: string,
  filterPersistence?: boolean
) {
  const renderCheckbox = (column: TableColumn<RecordType, 'text'>) => {
    return <Checkbox
      key={index}
      checked={(filterValues[column?.filterKey as keyof Filter] === undefined &&
        column?.defaultFilteredValue?.[0] as boolean) ||
        !!filterValues[column?.filterKey as keyof Filter]?.[0]}
      onChange={(e: CheckboxChangeEvent) => {
        const isChecked = e.target.checked
        if (column.filterValueNullable === false) {
          setFilterValues({ ...filterValues, [key]: undefined })
        } else {
          setFilterValues({ ...filterValues, [key]: [isChecked] })
          if(filterPersistence){
            sessionStorage.setItem(`${settingsId}-filter`,
              JSON.stringify({ ...filterValues, [key]: [isChecked] }))
          }
        }
      }}>{column?.filterComponent?.label}</Checkbox>
  }

  const filterTypeComp = {
    checkbox: renderCheckbox(column),
    rangepicker: <RangePickerComp
      key='range-picker'
      filterValues={filterValues}
      setFilterValues={setFilterValues}
      settingsId={settingsId}
      filterPersistence={filterPersistence}
    />
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
            addToFilter(data, _.get(child, key) as unknown as string)
          }
        }
        addToFilter(data, _.get(datum, key) as unknown as string)
        return data
      }, []).sort().map(v => ({ key: v, value: v, label: v }))
      : []

  const getValue = (value: unknown | string[], filterValueArray: undefined | boolean) => {
    if (filterValueArray && value) {
      return Array.isArray(value) ? (value as string[]).join(',') : value
    }
    return value
  }

  return filterTypeComp[column.filterComponent?.type as Type] || <UI.FilterSelect
    data-testid='options-selector'
    key={index}
    maxTagCount='responsive'
    mode={column.filterMultiple === false ? undefined : 'multiple'}
    showSearch={column?.filterSearchable ?? undefined}
    value={getValue(filterValues[key as keyof Filter], column.filterValueArray)}
    onChange={(value: unknown | string) => {
      const isValidValue = Array.isArray(value) ? (value as string[]).length : value
      const filterArrayValue = column.filterValueArray && value?(value as string).split(','):[value]
      const filterValue = Array.isArray(value) ? value : filterArrayValue
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

      if(filterPersistence){
        sessionStorage.setItem(`${settingsId}-filter`, JSON.stringify(filters))
      }
      setFilterValues(filters)
    }}
    filterOption={filterOption}
    dropdownMatchSelectWidth={false}
    placeholder={column.filterPlaceholder ?? column.title as string}
    showArrow
    allowClear
    style={{ width }}
    options={column.fitlerCustomOptions}
  >
    {!Array.isArray(column.fitlerCustomOptions) && options?.map((option, index) =>
      <Select.Option
        value={option.key}
        key={`key-${index}-${option.key}`}
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
