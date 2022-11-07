import { useIntl } from 'react-intl'

import { notAvailableMsg } from '@acx-ui/utils'

import * as UI from './styledComponents'

interface NoDataWrapperProps {
  text?: string
}

export function NoData ({ text }: NoDataWrapperProps) {
  const { $t } = useIntl()
  text = text ? text : $t({ defaultMessage: 'No data to display' })
  return (
    <UI.NoDataWrapper>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </UI.NoDataWrapper>
  )
}

export function NoActiveData ({ text }: NoDataWrapperProps) {
  const { $t } = useIntl()
  text = text ? text : $t({ defaultMessage: 'No active data' })
  return (
    <UI.NoDataWrapper>
      <UI.TextWrapper><UI.GreenTickIcon /></UI.TextWrapper>
      <UI.NoActiveTextWrapper>{text}</UI.NoActiveTextWrapper>
    </UI.NoDataWrapper>
  )
}

export function NotAvailable (props: { height?: number }) {
  const { $t } = useIntl()
  return (
    <div style={{ height: props.height || 150 }}>
      <NoData text={$t(notAvailableMsg)}/>
    </div>
  )
}
