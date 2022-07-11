import { useState } from 'react'

import ProTable           from '@ant-design/pro-table'
import { Space, Divider } from 'antd'

import * as UI from './styledComponents'

import type { ProColumns }                  from '@ant-design/pro-table'
import type { TableProps as AntTableProps } from 'antd'

export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered' | 'columns' > {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'tooltip'
    columns?: ProColumns<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
    }>
  }

export function Table <RecordType extends object> (
  { type = 'tall', ...props }: TableProps<RecordType>
) {
  const rowKey:string = props.rowKey as string || 'key'
  let defaultSelectedRowsData:any[] = [] 
  if (props.rowSelection?.defaultSelectedRowKeys) {
    defaultSelectedRowsData = props.rowSelection.defaultSelectedRowKeys.map(
      item => ({ [rowKey]: item })
    )
  }
  const [selectedRowsData, setSelectedRowsData] = useState(defaultSelectedRowsData)
  const defaultRowSelection: TableProps<RecordType>['rowSelection'] = {
    selectedRowKeys: selectedRowsData.map(item => item[rowKey]),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowsData(selectedRows)
    }
  }
  const onRowClick = (row: {[index: string]: any}) => {
    if (props.rowSelection) {
      if (props.rowSelection?.type == 'radio') { // single select
        setSelectedRowsData([row])
      } else { // multiple select
        const rowIndex = selectedRowsData.findIndex(item => item[rowKey] == row[rowKey])
        if (rowIndex === -1) {
          setSelectedRowsData([...selectedRowsData, row])
        } else {
          let tmp = [...selectedRowsData]
          tmp.splice(rowIndex, 1)
          setSelectedRowsData(tmp)
        }
      }
    }
  }
  if (props.rowSelection) {
    props.rowSelection = { ...defaultRowSelection, ...props.rowSelection }
  }
  return <UI.Wrapper $type={type} $rowSelection={props.rowSelection}>
    <ProTable<RecordType>
      {...props}
      bordered={false}
      options={false}
      search={false}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columns={props.columns}
      columnEmptyText={false}
      onRow={(record) => ({
        onClick: () => { onRowClick(record) }
      })}
      tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
        <Space size={32}>
          <Space size={6}>
            <span>{selectedRowKeys.length} selected</span>
            <UI.CloseButton onClick={onCleanSelected} title='Clear selection' />
          </Space>
          <Space size={0} split={<Divider type='vertical' />}>
            {props.actions?.map((option) =>
              <UI.ActionButton
                key={option.label}
                onClick={() => {
                  option.onClick(selectedRowsData, () => { onCleanSelected() })
                }
                }
                children={option.label}
              />
            )}
          </Space>
        </Space>
      )}
      tableAlertOptionRender={false}
    />
  </UI.Wrapper>
}
