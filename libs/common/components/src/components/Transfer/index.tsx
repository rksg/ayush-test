import React from 'react'

import { TableColumnsType, Transfer as AntTransfer, TransferProps as AntTransferProps } from 'antd'
import { SelectAllLabel }                                                               from 'antd/es/transfer'
import { TransferItem }                                                                 from 'antd/lib/transfer'
import { useIntl }                                                                      from 'react-intl'

import { renderTransferTable } from './renderTypes'
import * as UI                 from './styledComponents'

export type TransferProps =
  | AntTransferProps<TransferItem> & { type?: 'default' }
  | AntTransferProps<TransferItem> & {
      type: 'table'
      tableData: TransferItem[]
      leftColumns: TableColumnsType<TransferItem>
      rightColumns: TableColumnsType<TransferItem>
    }

export function Transfer (props: TransferProps) {
  const { $t } = useIntl()

  let selectAllLabels = [
    ({ totalCount }) => (
      <div>
        <UI.Title>{props?.titles?.[0]}</UI.Title>
        <UI.SelectedCount>{$t({ defaultMessage: '{totalCount} available' }, {
          totalCount
        })}</UI.SelectedCount>
      </div>
    ),
    ({ totalCount }) => (
      <div>
        <UI.Title>{props?.titles?.[1]}</UI.Title>
        <UI.SelectedCount>{$t({ defaultMessage: '{totalCount} selected' }, {
          totalCount
        })}</UI.SelectedCount>
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
