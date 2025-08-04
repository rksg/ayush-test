import React from 'react'

import { RolesEnum, ScopeKeys, RbacOpsIds } from '@acx-ui/types'

import type {
  ColumnsState as AntColumnsState
} from '@ant-design/pro-table'

/**
 * Column order & Show/hide state
 * order of item based on the order of the key in the hash
 */
export type ColumnState = { [columnKey: string]: boolean }
export type ColumnStateOption = {
  defaultValue?: ColumnState,
  onChange?: (state: ColumnState) => void
}

export type TableColumnState = Record<string, AntColumnsState>

export type RecordWithChildren <RecordType> = RecordType & {
  children?: RecordType[]
}

export type TableAction = {
  key?: string
  scopeKey?: ScopeKeys
  rbacOpsIds?: RbacOpsIds
  allowedOperationUrl?: string
  label: string
  disabled?: boolean
  tooltip?: string
  onClick?: () => void
  dropdownMenu?: Omit<MenuProps, 'placement'>
}

export type TableRowAction<RecordType> = {
  key?: string
  scopeKey?: ScopeKeys
  rbacOpsIds?: RbacOpsIds
  roles?: RolesEnum[]
  allowedOperationUrl?: string
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
  tooltip?: string
  onClick?: () => void
  dropdownMenu?: Omit<MenuProps, 'placement'>
}
