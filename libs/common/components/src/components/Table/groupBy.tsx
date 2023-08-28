/* eslint-disable */
import { useMemo, Key } from 'react'

import { Select }    from 'antd'
import _             from 'lodash'
import { IntlShape } from 'react-intl'

import * as UI from './styledComponents'
import type { ParamsType }        from '@ant-design/pro-provider'

import { TableProps } from '.'

import type { TableColumnState } from './types'
import React from 'react'

export function GroupSelect<RecordType> ({
  $t, value, setValue, groupable, style
}: {
  $t: IntlShape['$t'],
  value: string | undefined,
  setValue: (val: string | undefined) => void,
  groupable: TableProps<RecordType>['columns'],
  style?: React.CSSProperties
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
    style={style}
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
  groupByValue: string | undefined,
  columnsState: TableColumnState,
  rowKey: TableProps<RecordType>['rowKey']
  ) {
  return useMemo(() => {
    const groupable = columns.filter(col => col.groupable)
    const isGroupByActive = typeof groupByValue !== 'undefined'
    const targetCol = groupable.find(col => col.key === groupByValue)
    const attributes = targetCol?.groupable?.attributes ?? []
    const actionsList = targetCol?.groupable?.actions ?? []
    let expandedRows = expandedRowKeys
    const onExpand = (expanded: boolean, record: RecordType & Record<"children"| Key, unknown>) => {
      const key = typeof rowKey === 'function' ? rowKey(record) : record?.[rowKey as unknown as Key]
      if('children' in record && expanded)
      expandedRows?.push(key as Key)
      if('children' in record && !expanded)
      expandedRows?.splice(expandedRows?.indexOf(key as Key), 1);
    }
    const renderGroupRow = (record: RecordType) => (
      <UI.GroupRow>
        <UI.GroupCell>
          {attributes.map(({ key, renderer }) => <div key={key}>{renderer(record)}</div>)}
        </UI.GroupCell>
        <UI.GroupCell>
          {actionsList.map(({ key, renderer }) => <div key={key}>{renderer(record)}</div>)}
        </UI.GroupCell>
      </UI.GroupRow>
    )
    const columnCount = columns.reduce((count, column) => columnsState
      && columnsState[column.key]
      && columnsState[column.key].show !== false
      ? count + ('children' in column ? column.children?.length || 1 : 1)
      : count, 0)
    const addColSpan = (colSpan: number) =>
      (record: RecordType) => 'children' in record && !('isFirstLevel' in record) ? ({ colSpan }) : ({})
    return {
      groupable,
      columns: isGroupByActive
        ? columns.map((column, columnIndex) => {
          const { render, searchable, dataIndex } = column
          const renderer: typeof render = (dom, record, index, highlightFn, action, schema) => {
            if ('children' in record && !('isFirstLevel' in record)) {
              return columnIndex === 0 ? renderGroupRow(record) : null
            }
            else {
              if (render) {
                return render(dom, record, index, highlightFn, action, schema)
              }
              if (searchable) {
                return highlightFn(_.get(record, dataIndex))
              }

              return React.isValidElement(dom) ? dom: null
            }
          }
          return {
            ...column,
            onCell: addColSpan(columnIndex === 0 ? columnCount : 0),
            render: renderer,
            ...('children' in column
              ? { children: column.children?.map(child => ({ ...child, onCell: addColSpan(0) })) }
              : {}
            )
          }
        })
        : columns,
      isGroupByActive,
      expandable: isGroupByActive ? { expandedRowKeys : expandedRows, showExpandColumn: true } : undefined,
      onExpand
    }
  }, [columns, groupByValue, expandedRowKeys, columnsState])
}
