import { useMemo } from 'react'

import { TableColumnsType, Transfer as AntTransfer, TransferProps as AntTransferProps } from 'antd'
import { SelectAllLabel }                                                               from 'antd/es/transfer'
import { TransferListBodyProps }                                                        from 'antd/es/transfer/ListBody'
import { TransferItem }                                                                 from 'antd/lib/transfer'
import { useIntl }                                                                      from 'react-intl'

import {
  flattenTree,
  renderTransferTable,
  renderTransferGroupedTree,
  TreeTransferItem
} from './renderTypes'
import * as UI from './styledComponents'

export enum TransferType {
  DEFAULT = 'default',
  TABLE = 'table',
  GROUPED_TREE = 'grouped-tree'
}

type BaseTransferProps = AntTransferProps<TransferItem> & {
  excludeDisabledInCount?: boolean
  enableMultiselect?: boolean
  enableGroupSelect?: boolean
}

export type TransferProps =
  | BaseTransferProps & { type?: TransferType.DEFAULT | TransferType.GROUPED_TREE }
  | BaseTransferProps & {
      type: TransferType.TABLE
      tableData: TransferItem[]
      leftColumns: TableColumnsType<TransferItem>
      rightColumns: TableColumnsType<TransferItem>
    }

export function Transfer (props: TransferProps) {
  const { $t } = useIntl()
  const { type } = props

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

  const selectAllLabels = [
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

  const dataSource = useMemo(() => {
    if (type === TransferType.GROUPED_TREE) {
      return flattenTree(props.dataSource as TreeTransferItem[])
    }
    return props.dataSource
  }, [props.dataSource, type])

  const renderTransfer = (transferProps: TransferListBodyProps<TransferItem>) => {
    switch (type) {
      case TransferType.TABLE:
        // eslint-disable-next-line max-len
        return renderTransferTable(props as Extract<TransferProps, { type: TransferType.TABLE }>, transferProps)
      case TransferType.GROUPED_TREE:
        return renderTransferGroupedTree(
          props, transferProps as TransferListBodyProps<TreeTransferItem>
        )
      default:
        return props?.children?.(transferProps)
    }
  }

  return <UI.TransferLayout>
    <AntTransfer
      {...props}
      titles={[]}
      dataSource={dataSource}
      selectAllLabels={selectAllLabels}
      locale={{
        searchPlaceholder: $t({ defaultMessage: 'Search...' })
      }}
      showSearch={
        type === TransferType.GROUPED_TREE ? false : props.showSearch
      }
    >
      {(transferProps) => renderTransfer(transferProps)}
    </AntTransfer>
  </UI.TransferLayout>
}
