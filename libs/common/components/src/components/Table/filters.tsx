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
  groupables: TableProps<RecordType>['groupable']
) {
  const [value, setValue] = React.useState<string | undefined>(undefined)

  if (groupables) {
    const { selectors, onChange, onClear } = groupables

    const GroupBySelect = () => {
      return <UI.FilterSelect
        placeholder='Group By...'
        allowClear
        showArrow
        value={value}
        onChange={(val, options) => {
          onChange(val)
          const typedOption = options as { key: string, children: string }
          setValue(typedOption.children)
        }}
        onClear={() => {
          onClear()
          setValue(undefined)
        }}
        key='group-by-select'
      >
        {selectors.map(item => <Select.Option
          key={item.key}
          value={item.key}
          data-testid={`option-${item.key}`}
        >
          {item.label}
        </Select.Option>)}
      </UI.FilterSelect>
    }

    const getChildrenHelper = (record: unknown) =>
      (record as unknown as { children: RecordType[] | undefined }).children

    const isValidParent = (children: RecordType[] | undefined) =>
      Boolean(children && children.length > 0)

    const expandable: TableProps<RecordType>['expandable'] = {
      expandRowByClick: true,
      defaultExpandAllRows: true,
      rowExpandable: (record) => {
        const children = getChildrenHelper(record)
        return isValidParent(children)
      },
      expandIcon: (props) => {
        const children = getChildrenHelper(props.record)
        if (!isValidParent(children)) return null
        const ExpandIcon = ({ isActive }: { isActive: boolean }) => (isActive)
          ? <CollapseInactive />
          : <CollapseActive />
        return <ExpandIcon isActive={props.expanded}/>
      }
    }



    return { GroupBySelect, expandable }
  }

  return {
    GroupBySelect: () => null,
    expandable: undefined
  }
}
