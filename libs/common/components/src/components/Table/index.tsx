import React, { useMemo, useState, Key } from 'react'

import ProTable, { ProTableProps as ProAntTableProps } from '@ant-design/pro-table'
import { Space, Divider, Button, Select, Input }       from 'antd'
import _                                               from 'lodash'
import Highlighter                                     from 'react-highlight-words'
import { useIntl }                                     from 'react-intl'

import { SettingsOutlined } from '@acx-ui/icons'

import * as UI                          from './styledComponents'
import { settingsKey, useColumnsState } from './useColumnsState'

import type { Columns, ColumnStateOption }  from './types'
import type { ParamsType }                  from '@ant-design/pro-provider'
import type { SettingOptionType }           from '@ant-design/pro-table/lib/components/ToolBar'
import type { TableProps as AntTableProps } from 'antd'

export interface TableProps <RecordType>
  extends Omit<ProAntTableProps<RecordType, ParamsType>,
  'bordered' | 'columns' | 'title' | 'type' | 'rowSelection'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip'
    rowKey?: Exclude<ProAntTableProps<RecordType, ParamsType>['rowKey'], Function>
    columns: Columns<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
    }>
    columnState?: ColumnStateOption
    rowSelection?: (AntTableProps<RecordType>['rowSelection'] & {
      alwaysShowAlert?: boolean;
  })
  }

interface FilterValue {
  key: string[]
}

export function Table <RecordType extends object> (
  { type = 'tall', columnState, dataSource, ...props }: TableProps<RecordType>
) {
  const { $t } = useIntl()
  const [filterValues, setFilterValues] = useState<FilterValue>({} as FilterValue)
  const [searchValue, setSearchValue] = useState<string>('')

  let columns = useMemo(() => {
    const settingsColumn = {
      key: settingsKey,
      fixed: 'right' as 'right',
      width: 32,
      children: []
    }

    const cols = type === 'tall'
      ? [...props.columns, settingsColumn] as typeof props.columns
      : props.columns

    return cols.map(column => ({
      ...column,
      disable: Boolean(column.fixed || column.disable),
      show: Boolean(column.fixed || column.disable || (column.show ?? true))
    }))
  }, [props.columns, type])

  const columnsState = useColumnsState({ columns, columnState })

  const setting: SettingOptionType | false = type === 'tall' ? {
    draggable: true,
    checkable: true,
    checkedReset: false,
    extra: <div>
      <UI.TableSettingTitle children={$t({ defaultMessage: 'Select Columns' })} />
      <Button
        type='link'
        size='small'
        onClick={columnsState.resetState}
        children={$t({ defaultMessage: 'Reset to default' })}
      />
    </div>,
    children: <SettingsOutlined />
  } : false

  const rowKey = (props.rowKey ?? 'key') as keyof RecordType

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(props.rowSelection?.selectedRowKeys
    ?? props.rowSelection?.defaultSelectedRowKeys
    ?? [])

  // needed to store selectedRows because `tableAlertRender`
  // somehow doesn't pass in sync selected data between selectedRows & selectedRowKeys
  const [selectedRows, setSelectedRows]
    = useState<RecordType[]>(dataSource
      ?.filter(item => selectedRowKeys.includes(item[rowKey] as unknown as Key)) ?? [])

  const onRowClick = (record: RecordType) => {
    if (!props.rowSelection) return

    const key = record[rowKey] as unknown as Key
    const isSelected = selectedRowKeys.includes(key)

    if (props.rowSelection.type === 'radio') {
      if (!isSelected) {
        setSelectedRowKeys([key])
        setSelectedRows([record])
      }
    } else {
      setSelectedRowKeys(isSelected
        // remove if selected
        ? selectedRowKeys.filter(k => k !== key)
        // add into collection if not selected
        : [...selectedRowKeys, key])
      setSelectedRows(isSelected
        // remove if selected
        ? selectedRows.filter(item => item[rowKey] !== record[rowKey])
        // add into collection if not selected
        : [...selectedRows, record])
    }
  }
  columns = columns.map(column => column.searchable && searchValue
    ? {
      ...column,
      render: text => <Highlighter
        highlightStyle={{
          fontWeight: 'bold',
          background: 'none',
          padding: 0
        }}
        searchWords={[searchValue]}
        autoEscape
        textToHighlight={text ? text.toString() : ''}
      />
    }
    : column
  )
  const filterables = columns.filter(column => column.filterable)
  const activeFilters = filterables.filter(column => {
    const key = (column.dataIndex ?? column.key) as keyof RecordType
    const filteredValue = filterValues[key as keyof FilterValue]
    return filteredValue && filteredValue.length
  })
  const searchables = columns.filter(column => column.searchable)
  const filteredData = dataSource && dataSource.filter(row => {
    for (const column of activeFilters) {
      const key = (column.dataIndex ?? column.key) as keyof RecordType
      const filteredValue = filterValues[key as keyof FilterValue]
      if (!filteredValue.includes(row[key] as unknown as string)) {
        return false
      }
    }
    if (searchValue) {
      return searchables.some(column => {
        const key = (column.dataIndex ?? column.key) as keyof RecordType
        return (row[key] as unknown as string)
          .toString()
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      })
    }
    // TODO nested rows
    // TODO move clear filter to the right
    return true
  })

  const hasRowSelected = Boolean(selectedRowKeys.length)
  const hasHeader = !hasRowSelected && (Boolean(filterables.length) || Boolean(searchables.length))
  const rowSelection: TableProps<RecordType>['rowSelection'] = props.rowSelection ? {
    ..._.omit(props.rowSelection, 'defaultSelectedRowKeys'),
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (keys, rows, info) => {
      setSelectedRowKeys(keys)
      setSelectedRows(rows)
      props.rowSelection?.onChange?.(keys, rows, info)
    }
  } : undefined

  const onRow: TableProps<RecordType>['onRow'] = function (record) {
    const defaultOnRow = props.onRow?.(record)
    return {
      ...defaultOnRow,
      onClick: (event) => {
        onRowClick(record)
        defaultOnRow?.onClick?.(event)
      }
    }
  }

  return <UI.Wrapper
    $type={type}
    $rowSelectionActive={Boolean(props.rowSelection) && !hasHeader}
  >
    {hasHeader && (
      <UI.Header>
        {Boolean(searchables.length) && <Input
          onChange={e => setSearchValue(e.target.value)}
          placeholder={$t({ defaultMessage: 'Search {searchables}' }, {
            searchables: searchables.map(column => column.title).join(', ')
          })}
          style={{ width: 292 }}
          value={searchValue}
        />}
        {filterables.map((column, i) => {
          const key = (column.dataIndex ?? column.key) as keyof RecordType
          return <Select
            key={i}
            maxTagCount='responsive'
            mode='multiple'
            value={filterValues[key as keyof FilterValue]}
            onChange={value => setFilterValues({ ...filterValues, [key]: value })}
            placeholder={column.title as string}
            showArrow
            style={{ width: 200 }}
          >
            {_.uniq(dataSource?.map(datum => datum[key] as unknown as string)).map(value =>
              <Select.Option value={value} key={value}>{value}</Select.Option>
            )}
          </Select>
        })}
        {(Boolean(activeFilters.length) || Boolean(searchValue)) && <UI.ClearButton
          onClick={() => {
            setFilterValues({} as FilterValue)
            setSearchValue('')
          }}
        >
          {$t({ defaultMessage: 'Clear Filters' })}
        </UI.ClearButton>}
      </UI.Header>
    )}
    <UI.TableSettingsGlobalOverride />
    <ProTable<RecordType>
      {...props}
      dataSource={filteredData}
      bordered={false}
      search={false}
      columns={columns}
      options={{ setting, reload: false, density: false }}
      columnsState={columnsState}
      scroll={{ x: 'max-content' }}
      rowSelection={rowSelection}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columnEmptyText={false}
      onRow={onRow}
      tableAlertOptionRender={false}
      tableAlertRender={({ onCleanSelected }) => (
        <Space size={32}>
          <Space size={6}>
            <span>
              {$t({ defaultMessage: '{count} selected' }, { count: selectedRows.length })}
            </span>
            <UI.CloseButton
              onClick={onCleanSelected}
              title={$t({ defaultMessage: 'Clear selection' })}
            />
          </Space>
          <Space size={0} split={<Divider type='vertical' />}>
            {props.actions?.map((option) =>
              <UI.ActionButton
                key={option.label}
                onClick={() => option.onClick(selectedRows, () => { onCleanSelected() })}
                children={option.label}
              />
            )}
          </Space>
        </Space>
      )}
    />
  </UI.Wrapper>
}
