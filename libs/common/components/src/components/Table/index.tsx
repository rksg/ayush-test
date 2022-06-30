import ProTable           from '@ant-design/pro-table'
import { Space, Divider } from 'antd'

import * as UI from './styledComponents'

import type { ProColumns }                  from '@ant-design/pro-table'
import type { TableProps as AntTableProps } from 'antd'

export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered' | 'columns' > {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'rotated' | 'tooltip'
    columns?: ProColumns<RecordType, 'text'>[]
    actions?: Array<{
      label: string,
      onClick: (arg: RecordType[]) => void
    }>
  }

export function Table <RecordType extends object> (
  { type = 'tall', ...props }: TableProps<RecordType>
) {
  let columns = props.columns
  if (type === 'rotated' && columns) {
    columns = columns.map(column => {
      if (column.sorter) return column

      const Title = column.title
      return {
        ...column,
        title: typeof Title === 'function'
          ? (props) => <UI.RotatedColumn children={Title(props, undefined, null)} />
          : <UI.RotatedColumn children={Title} />
      }
    })
  }

  return <UI.Wrapper $type={type}>
    <ProTable<RecordType>
      {...props}
      bordered={false}
      options={false}
      search={false}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columns={columns}
      tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
        <Space size={32}>
          <Space size={6}>
            <span>{selectedRowKeys.length} selected</span>
            <UI.CloseButton onClick={onCleanSelected} title='clear selection' />
          </Space>
          <Space size={0} split={<Divider type='vertical' />}>
            {props.actions?.map((option) =>
              <UI.ActionButton
                key={option.label}
                onClick={()=>option.onClick(selectedRows)}
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
