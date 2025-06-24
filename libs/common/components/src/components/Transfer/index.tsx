import { TableColumnsType, Transfer as AntTransfer, TransferProps as AntTransferProps } from 'antd'
import { SelectAllLabel }                                                               from 'antd/es/transfer'
import { TransferItem }                                                                 from 'antd/lib/transfer'
import { useIntl }                                                                      from 'react-intl'

import { renderTransferTable } from './renderTypes'
import * as UI                 from './styledComponents'

type BaseTransferProps = AntTransferProps<TransferItem> & {
  excludeDisabledInCount?: boolean
}

export type TransferProps =
  | BaseTransferProps & { type?: 'default' }
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

  return <UI.TransferLayout>
    <AntTransfer
      {...props}
      titles={[]}
      selectAllLabels={selectAllLabels}
      locale={{
        searchPlaceholder: $t({ defaultMessage: 'Search...' })
      }}
    >
      {(transferProps) => {
        return props.type === 'table'
          ? renderTransferTable(props, transferProps)
          : props?.children?.(transferProps)
      }}
    </AntTransfer>
  </UI.TransferLayout>
}
