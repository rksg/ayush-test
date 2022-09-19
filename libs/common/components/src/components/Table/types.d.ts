
import type {
  ProColumnType,
  ColumnsState as AntColumnsState
} from '@ant-design/pro-table'

type AdditionalColumnType = {
  // mandatory column for mapping columns
  key: string
  /**
   * Mark column as fixed
   */
  fixed?: 'left'
  /**
   * Mark column as unable to move
   * If `fixed` is set, this prop will be override to `true`
   */
  disable?: boolean
  /**
   * Show this column in table
   * If `fixed` is set, this prop will be override to `true`
   * If `disable` is set, this prop will be override to `true`
   * @default true
   */
  show?: boolean
  // overwrite type of width to number for column resize
  width?: number
  /**
   * Set the column to be searchable
   * If one column has this to true the table will start showing search input
   * @default false
   */
  searchable?: boolean
  /**
   * Set the column to be filterable
   * the table will show a multi select dropdown to filter the column
   * @default false
   */
  filterable?: boolean
}

type ProColumnTypeSubset <RecordType, ValueType> = Omit<
  ProColumnType<RecordType, ValueType>,
  'fixed' | 'hideInTable' | 'hideInform' | 'hideInSetting' | 'hideInSearch'
>

export type ColumnGroupType<RecordType, ValueType>
  = ColumnType<RecordType, ValueType>
  & { children: TableColumn<RecordType>[] }

export type ColumnType <RecordType = unknown, ValueType = 'text'>
  = ProColumnTypeSubset<RecordType, ValueType>
  & AdditionalColumnType

export type TableColumn<RecordType = unknown, ValueType = 'text'>
  = ColumnGroupType<RecordType, ValueType>
  | ColumnType<RecordType, ValueType>

/**
 * Column order & Show/hide state
 * order of item based on the order of the key in the hash
 */
export type ColumnState = { [columnKey: string]: boolean }
export type ColumnStateOption = {
  defaultValue?: ColumnState
  // value?: ColumnState
  onChange?: (state: ColumnState) => void
}

export type TableColumnState = Record<string, AntColumnsState>

export type RecordWithChildren <RecordType> = RecordType & {
  children?: RecordType[]
}
