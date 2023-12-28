import { Transfer as AntTransfer, TransferProps } from 'antd'
import { TransferItem }                           from 'antd/lib/transfer'
import { useIntl }                                from 'react-intl'

import * as UI from './styledComponents'

export function Transfer (props: TransferProps<TransferItem>) {
  const { $t } = useIntl()
  return <UI.TransferLayout>
    <AntTransfer
      {...props}
      titles={[]}
      selectAllLabels={[
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
      ]}
      locale={{
        searchPlaceholder: $t({ defaultMessage: 'Search...' })
      }}
    />
  </UI.TransferLayout>
}