
import type {
  ProColumnType,
  ColumnsState as AntColumnsState
} from '@ant-design/pro-table'

type AdditionalColumnType = {
  /**
   * Mark column as fixed
   */
  fixed?: 'left' | 'right'
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
}

type ProColumnTypeSubset <RecordType, ValueType> = Omit<
  ProColumnType<RecordType, ValueType>,
  'fixed' | 'hideInTable' | 'hideInform' | 'hideInSetting' | 'hideInSearch'
>

type ColumnGroupType<RecordType, ValueType>
  = ColumnType<RecordType, ValueType>
  & { children: Columns<RecordType>[] }

type ColumnType <RecordType = unknown, ValueType = 'text'>
  = ProColumnTypeSubset<RecordType, ValueType>
  & AdditionalColumnType

export type Columns<RecordType = unknown, ValueType = 'text'>
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
