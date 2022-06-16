import { Table as AntTable } from 'antd'

import * as UI from './styledComponents'

import type { TableProps as AntTableProps } from 'antd'
export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'rotated'
  }

export function Table <RecordType extends object> (
  { type = 'tall', ...props }: TableProps<RecordType>
) {
  let columns = props.columns?.map((column)=>({
    ...column,
    ...(column.align && { className: `ant-table-column-al-${column.align}` })
  }))
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
    <AntTable<RecordType>
      {...props}
      bordered={false}
      pagination={props.pagination || (type === 'tall' ? undefined : false)}
      columns={columns}
    />
  </UI.Wrapper>
}
