import { ColumnType, TableProps } from '@acx-ui/components'
import { RequestPayload }         from '@acx-ui/types'
import { TableQuery }             from '@acx-ui/utils'

export interface ApGroupTableProps<T>
  extends Omit<TableProps<T>, 'columns'> {
  tableQuery?: TableQuery<T, RequestPayload<unknown>, unknown>
  enableActions?: boolean
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}