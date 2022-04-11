import { Table as AntTable, TableProps } from 'antd'
import * as UI                           from './styledComponents'

export const Table = function Table<RecordType extends object> (
  props: Omit<TableProps<RecordType>, 'bordered'>
) {
  return <UI.Wrapper>
    <AntTable<RecordType> bordered={false} {...props} />
  </UI.Wrapper>
}
