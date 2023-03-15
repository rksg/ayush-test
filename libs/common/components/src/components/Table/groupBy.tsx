import { useMemo, Key } from 'react'

import { Select }    from 'antd'
import { IntlShape } from 'react-intl'

import * as UI                from './styledComponents'
import { RecordWithChildren } from './types'

import { TableProps } from '.'

export function GroupSelect<RecordType> ({
  $t, value, setValue, groupable
}: {
  $t: IntlShape['$t'],
  value: string | undefined,
  setValue: (val: string | undefined) => void,
  groupable: TableProps<RecordType>['columns']
}) {
  const selectors = groupable
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
  columns: TableProps<RecordType>['columns'],
  expandedRowKeys: Key[] | undefined,
  groupByValue: string | undefined
) {
  return useMemo(() => {
    const groupable = columns.filter(col => col.groupable)
    if (groupable.length > 0) {
      const targetCol = groupable.find(col => col.key === groupByValue)
      const parentColumns = targetCol?.groupable!.parentColumns ?? []
      const isGroupByActive = typeof groupByValue !== 'undefined'
      const actionsList = targetCol?.groupable?.actions ?? []
      const groupActionColumns: TableProps<ParentRecord>['columns'] = actionsList
        .map((val) => ({
          key: val.key,
          dataIndex: '',
          render: (_, record) => 'children' in record ? val.label(record) : null
        }))
      const expandable: TableProps<ParentRecord>['expandable'] = {
        expandedRowKeys,
        showExpandColumn: false
      }
      return {
        groupable,
        parentColumns,
        isGroupByActive,
        groupActionColumns,
        expandable: (isGroupByActive) ? expandable : undefined
      }
    }
    return {
      groupable,
      parentColumns: [],
      isGroupByActive: false,
      groupActionColumns: [],
      expandable: undefined
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupByValue, expandedRowKeys])
}
