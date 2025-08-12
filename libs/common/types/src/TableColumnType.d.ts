import { ReactNode } from 'react'

import type { ProColumnType } from '@ant-design/pro-table'
import type {
  ProSchema,
  ProCoreActionType,
  ProSchemaComponentTypes
}                    from '@ant-design/pro-utils'
import type { DataIndex } from 'rc-table/lib/interface'


type AdditionalColumnType <RecordType, ValueType> = {
  // mandatory column for mapping columns
  key: string
  // mandatory column to (1) render correct data (2) use ellipsis
  dataIndex: DataIndex
  /**
   * Mark column as fixed
   */
  fixed?: 'left' | 'right' | undefined
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
  /**
   * Width for the column, default to 120
   *
   * If `width: Infinity` the resulting width will be 360
   * @default 120
   */
  width?: number
  /**
   * Minimum width for the resizable column.
   *
   * If `minWidth` is set, column width cannot be resized to be less than `minWidth`.
   * @default undefined
   */
  minWidth?: number
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
  filterable?: boolean | ({ key: string, value: string, label?: React.ReactNode }) [] | OptionType[]
  /**
   * Set the key in filters of payload
   * It is useful when the dataIndex is different from the filter key
   * @default undefined
   */
  filterKey?: React.Key
  /**
   * Set the value in filters to be nullable
   * It is useful when the value could not be null
   * @default undefined
   */
  filterValueNullable?: boolean
  /**
   * Set the value in filters to be array, and setting values with comma(,) to connect all values
   * Due to option value is array, UI ant component onChange event transform value is undefined
   * @default undefined
   */
  filterValueArray?: boolean
  /**
   * Set the filter to be searchable
   * @default undefined
   */
  filterSearchable?: boolean
  /**
   * Set the filter placeholder
   * If `filterPlaceholder` is set, this prop will be override to original filter placeholder
   * @default undefined
   */
  filterPlaceholder?: string
  /**
   * Allow filter to appear as one of the type specified
   */
  filterComponent?: ({
    type: 'checkbox',
    label?: string
  } | {
    type: 'rangepicker',
    unlimitedRange?: boolean
  })
  /**
   * Overwrite filterableWidth of table attribute
   */
  filterableWidth?: number

  filterCustomOptions?: OptionType[]
  /**
   * Set the key for Coordinated filters that have a hierarchical dependency
   * the relevant filter will be reset by key when changing the value
   * @default undefined
   */
  coordinatedKeys?: string[]
  /**
   * Add Beta indicator for column
   */
  isBetaFeature?: boolean
  /**
   * Taken the original type for antd and add highlightFn for handling highlight
   * @default undefined
   */
  render?: (
    dom: ReactNode,
    entity: RecordType,
    index: number,
    highlightFn: (
      value: string,
      formatFn?: (keyword: string) => React.ReactNode
    ) => ReactNode,
    action: ProCoreActionType | undefined,
    schema: ProSchema<RecordType, unknown, ProSchemaComponentTypes, ValueType> & {
      isEditable?: boolean;
      type: ProSchemaComponentTypes;
    }
  ) => ReactNode | {
    children: ReactNode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any
  } | (() => ReactNode),
  groupable?: {
    key: string,
    label: ReactNode,
    attributes: { key: string, renderer: (record: RecordType) => ReactNode }[]
    actions?: { key: string, renderer: (record: RecordType) => ReactNode }[]
  }
}


type ProColumnTypeSubset <RecordType, ValueType> = Omit<
  ProColumnType<RecordType, ValueType>,
  'fixed' | 'hideInTable' | 'hideInform' | 'hideInSetting' | 'hideInSearch' | 'render'
>

export type ColumnGroupType<RecordType, ValueType>
  = ColumnType<RecordType, ValueType>
  & { children: TableColumn<RecordType>[] }

export type ColumnType <RecordType = unknown, ValueType = 'text'>
  = ProColumnTypeSubset<RecordType, ValueType>
  & AdditionalColumnType<RecordType, ValueType>

export type TableColumn<RecordType = unknown, ValueType = 'text'>
  = ColumnGroupType<RecordType, ValueType>
  | ColumnType<RecordType, ValueType>
