import React, { ReactNode } from 'react'

import {
  ProSchema,
  ProCoreActionType,
  ProSchemaComponentTypes
}                    from '@ant-design/pro-utils/'
import { DataIndex } from 'rc-table/lib/interface'

import type {
  ProColumnType,
  ColumnsState as AntColumnsState
} from '@ant-design/pro-table'

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
  filterable?: boolean | ({ key: string, value: string, label?: React.ReactNode })[]
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

export type TableAction = {
  key?: string
  label: string
  disabled?: boolean
  tooltip?: string
  onClick?: () => void
  dropdownMenu?: Omit<MenuProps, 'placement'>
}

export type TableRowAction<RecordType> = {
  key?: string
  label: string
  disabled?: boolean | ((selectedItems: RecordType[]) => boolean)
  tooltip?: string | ((selectedItems: RecordType[]) => string | undefined)
  visible?: boolean | ((selectedItems: RecordType[]) => boolean)
  onClick: (selectedItems: RecordType[], clearSelection: () => void) => void
}

export type IconButtonProps = {
  key?: string
  icon: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  dropdownMenu?: Omit<MenuProps, 'placement'>
}
