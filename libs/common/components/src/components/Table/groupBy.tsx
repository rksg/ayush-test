import { useMemo, Key } from 'react'

import { Select }    from 'antd'
import { IntlShape } from 'react-intl'

import * as UI from './styledComponents'

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

export function useGroupBy<RecordType> (
  columns: TableProps<RecordType>['columns'],
  expandedRowKeys: Key[] | undefined,
  groupByValue: string | undefined
) {
  return useMemo(() => {
    const groupable = columns.filter(col => col.groupable)
    const isGroupByActive = typeof groupByValue !== 'undefined'
    const targetCol = groupable.find(col => col.key === groupByValue)
    const attributes = targetCol?.groupable?.attributes ?? []
    const actionsList = targetCol?.groupable?.actions ?? []
    return {
      groupable,
      renderGroupRow: (record: RecordType) => (
        <UI.GroupRow>
          <UI.GroupCell>
            {attributes.map(({ key, renderer }) => <div key={key}>{renderer(record)}</div>)}
          </UI.GroupCell>
          <UI.GroupCell>
            {actionsList.map(({ key, renderer }) => <div key={key}>{renderer(record)}</div>)}
          </UI.GroupCell>
        </UI.GroupRow>
      ),
      isGroupByActive,
      expandable: isGroupByActive ? { expandedRowKeys, showExpandColumn: false } : undefined
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupByValue, expandedRowKeys])
}
