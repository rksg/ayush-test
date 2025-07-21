import { useMemo, useState } from 'react'

import { TableColumnsType, Transfer as AntTransfer, TransferProps as AntTransferProps } from 'antd'
import { SelectAllLabel }                                                               from 'antd/es/transfer'
import { TransferItem }                                                                 from 'antd/lib/transfer'
import { useIntl }                                                                      from 'react-intl'

import {
  flattenTree,
  renderTransferTable,
  renderTransferGroupedTree
} from './renderTypes'
import * as UI from './styledComponents'

type BaseTransferProps = AntTransferProps<TransferItem> & {
  excludeDisabledInCount?: boolean
  enableMultiselect?: boolean
  enableGroupSelect?: boolean
}

export type TransferProps =
  | BaseTransferProps & { type?: 'default' | 'grouped-tree' }
  | BaseTransferProps & {
      type: 'table'
      tableData: TransferItem[]
      leftColumns: TableColumnsType<TransferItem>
      rightColumns: TableColumnsType<TransferItem>
    }

export function Transfer (props: TransferProps) {
  const { $t } = useIntl()

  const disabledDataSourceItemKeysSet = new Set(
    props.dataSource.filter((item) => item.disabled).map((item) => item.key)
  )

  const getTotalCountAvailable = (totalCount: number): number => {
    if (props.excludeDisabledInCount) {
      const targetKeys = new Set(props.targetKeys ?? [])
      const availableItems = props.dataSource.filter(
        ({ key, disabled }) => !disabled && key && !targetKeys.has(key)
      )
      return availableItems.length
    }
    return totalCount
  }

  const getTotalCountSelected = (totalCount: number): number => {
    if (props.excludeDisabledInCount) {
      const selectedItemsWithoutDisabled = (props.targetKeys ?? []).filter(
        (targetKey) => !disabledDataSourceItemKeysSet.has(targetKey)
      )
      return selectedItemsWithoutDisabled.length
    }
    return totalCount
  }

  let selectAllLabels = [
    ({ totalCount }) => (
      <div>
        <UI.Title>{props?.titles?.[0]}</UI.Title>
        <UI.SelectedCount>
          {$t(
            { defaultMessage: '{totalCount} available' },
            {
              totalCount: getTotalCountAvailable(totalCount)
            }
          )}
        </UI.SelectedCount>
      </div>
    ),
    ({ totalCount }) => (
      <div>
        <UI.Title>{props?.titles?.[1]}</UI.Title>
        <UI.SelectedCount>
          {$t(
            { defaultMessage: '{totalCount} selected' },
            {
              totalCount: getTotalCountSelected(totalCount)
            }
          )}
        </UI.SelectedCount>
      </div>
    )
  ] as SelectAllLabel[]

  const [searchText, setSearchText] = useState('')
  const flatDataSource = useMemo(() => flattenTree(props.dataSource), [props.dataSource])

  return <UI.TransferLayout>
    <AntTransfer
      {...props}
      dataSource={props.type === 'grouped-tree' ? flatDataSource : props.dataSource}
      titles={[]}
      selectAllLabels={selectAllLabels}
      locale={{
        searchPlaceholder: $t({ defaultMessage: 'Search...' })
      }}
      filterOption={(inputValue, item) => {
        if (props.type === 'grouped-tree') {
          setSearchText(inputValue)
          return true
        }
        return item.title?.toLowerCase().includes(inputValue.toLowerCase()) ?? false
      }}
    >
      {(transferProps) => {
        return props.type === 'table'
          ? renderTransferTable(props, transferProps)
          : (props.type === 'grouped-tree'
            ? renderTransferGroupedTree(props, transferProps, searchText)
            : props?.children?.(transferProps)
          )
      }}
    </AntTransfer>
  </UI.TransferLayout>
}
