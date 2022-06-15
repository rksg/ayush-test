import { Table as AntTable, Space } from 'antd'
import ProTable from '@ant-design/pro-table'
import type { ProColumns, ProTableProps as AntProTableProps } from '@ant-design/pro-table'

import * as UI from './styledComponents'

import type { TableProps as AntTableProps } from 'antd'
export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'rotated' | 'selectable'
    options?: true | false
    search?: true | false
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
          ? (props) => <UI.RotatedColumn children={<Title {...props} />} />
          : <UI.RotatedColumn children={Title} />
      }
    })
  }
  return <UI.Wrapper $type={type}>
    <ProTable<RecordType>
      {...props}
      bordered={false}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columns={columns}
    />
  </UI.Wrapper>
}
