import React, { useMemo } from 'react'

import ProTable                   from '@ant-design/pro-table'
import { Space, Divider, Button } from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { SettingsOutlined } from '@acx-ui/icons'

import * as UI             from './styledComponents'
import { useColumnsState } from './useColumnsState'

import type { Columns, ColumnStateOption }  from './types'
import type { SettingOptionType }           from '@ant-design/pro-table/lib/components/ToolBar'
import type { TableProps as AntTableProps } from 'antd'

const messages = {
  columnsSettingTitle: defineMessage({
    defaultMessage: 'Select Columns'
  }),
  resetColumns: defineMessage({
    defaultMessage: 'Reset to default'
  }),
  clearSelection: defineMessage({
    defaultMessage: 'Clear selection'
  }),
  selectedCount: defineMessage({
    defaultMessage: '{count} selected'
  })
}

export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered' | 'columns' | 'title'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip'
    columns: Columns<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
    }>
    columnState?: ColumnStateOption
  }

export function Table <RecordType extends object> (
  { type = 'tall', columnState, ...props }: TableProps<RecordType>
) {
  const { $t } = useIntl()
  const columns = useMemo(() => props.columns.map((column) => ({
    ...column,
    disable: Boolean(column.fixed || column.disable),
    show: Boolean(column.fixed || column.disable || (column.show ?? true))
  })), [props.columns])

  const columnsState = useColumnsState({ columns, columnState })

  const setting: SettingOptionType | false = type === 'tall' ? {
    draggable: true,
    checkable: true,
    checkedReset: false,
    extra: <div>
      <UI.TableSettingTitle children={$t(messages.columnsSettingTitle)} />
      <Button
        type='link'
        size='small'
        onClick={columnsState.resetState}
        children={$t(messages.resetColumns)}
      />
    </div>,
    children: <SettingsOutlined />
  } : false

  return <UI.Wrapper $type={type} $hasRowSelection={Boolean(props.rowSelection)}>
    <UI.TableSettingsGlobalOverride />
    <ProTable<RecordType>
      {...props}
      bordered={false}
      search={false}
      columns={columns}
      options={{ setting, reload: false, density: false }}
      columnsState={columnsState}
      scroll={{ x: 'max-content' }}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columnEmptyText={false}
      tableAlertOptionRender={false}
      tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
        <Space size={32}>
          <Space size={6}>
            <span>{$t(messages.selectedCount, { count: selectedRowKeys.length })}</span>
            <UI.CloseButton onClick={onCleanSelected} title={$t(messages.clearSelection)} />
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
