import { useMemo } from 'react'

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
) {
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

  return () => <UI.FilterSelect
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

export function GroupSelect<RecordType> ({
  $t, value, setValue, groupables
}: {
  $t: IntlShape['$t'],
  value: string | undefined,
  setValue: (val: string | undefined) => void,
  groupables: TableProps<RecordType>['columns']
}) {
  const selectors = groupables
    .filter(cols => Boolean(cols.groupable))
    .map(col => col.groupable!)
  return <UI.FilterSelect
    placeholder={$t({ defaultMessage: 'Group By...' })}
    allowClear
    showArrow
    value={value}
    onChange={(key) => {
      setValue(key as string | undefined)
    }}
    onClear={() => {
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

export function useGroupBy<RecordType, ParentRecord extends RecordWithChildren<RecordType>> (
  groupables: TableProps<RecordType>['columns'],
  groupByValue: string | undefined,
  setGroupByValue: (value: string | undefined) => void,
  colLength: number,
  intl: IntlShape
) {
  return useMemo(() => {
    const { $t } = intl

    if (groupables.length > 0) {
      const hasValidChildren = (record: ParentRecord) => {
        const { children } = record
        return Boolean(children) && Array.isArray(children) && children.length > 0
      }

      const GroupBySelect = () => <GroupSelect<RecordType>
        $t={$t}
        groupables={groupables}
        setValue={setGroupByValue}
        value={groupByValue}
      />

      // need to optimize for renders
      const targetCol = groupables.find(col => col.key === groupByValue)

      const finalParentColumns = targetCol?.groupable!.parentColumns

      const isGroupByActive = typeof groupByValue !== 'undefined'

      const actionsList = targetCol?.groupable?.actions ?? []
      const groupActionColumns: TableProps<ParentRecord>['columns'] = actionsList
        .map((val) => ({
          key: val.key,
          dataIndex: '',
          render: (_, record) => 'children' in record ? val.label(record) : null
        }))

      const expandable: TableProps<ParentRecord>['expandable'] = {
        expandIconColumnIndex: colLength + groupActionColumns.length,
        rowExpandable: (record) => hasValidChildren(record),
        defaultExpandAllRows: true,
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

      return {
        GroupBySelect,
        finalParentColumns,
        isGroupByActive,
        groupActionColumns,
        expandable: (isGroupByActive) ? expandable : undefined
      }
    }

    return {
      GroupBySelect: () => null,
      finalParentColumns: [],
      isGroupByActive: false,
      groupActionColumns: [],
      expandable: undefined
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupByValue, intl])
}
