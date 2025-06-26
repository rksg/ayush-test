import { ColumnType, TableProps } from '@acx-ui/components'
import { TableQuery } from '@acx-ui/utils'
import { RequestPayload }         from '@acx-ui/types'

export interface ApGroupTableProps<T>
  extends Omit<TableProps<T>, 'columns'> {
  tableQuery?: TableQuery<T, RequestPayload<unknown>, unknown>
  enableActions?: boolean
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}