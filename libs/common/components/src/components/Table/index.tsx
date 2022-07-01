import { Table as AntTable } from 'antd'
import { ColumnTitleProps }  from 'antd/lib/table/interface'

import * as UI from './styledComponents'

import type { TableProps as AntTableProps } from 'antd'
export interface TableProps <RecordType>
  extends Omit<AntTableProps<RecordType>, 'bordered'> {
    /** @default 'tall' */
    type?: 'tall' | 'compact' | 'rotated' | 'tooltip'
  }

export function Table <RecordType extends object> (
  { type = 'tall', ...props }: TableProps<RecordType>
) {
  let columns = props.columns
  if (type === 'rotated' && columns) {
    columns = columns.map(column => {
      if (column.sorter) return column

      return {
        ...column,
        title: typeof column.title === 'function'
          ? (props) => {
            const Title = column.title as React.FC<ColumnTitleProps<RecordType>>
            return <UI.RotatedColumn children={<Title {...props} />} />
          }
          : <UI.RotatedColumn children={column.title} />
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
