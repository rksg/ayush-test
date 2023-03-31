import { useIntl } from 'react-intl'

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
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </UI.NoDataWrapper>
  )
}

export function NoActiveContent ({ text }: NoDataWrapperProps) {
  const { $t } = useIntl()
  text = text ? text : $t({ defaultMessage: 'No active data' })
  return (
    <>
      <UI.TextWrapper><UI.GreenTickIcon /></UI.TextWrapper>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </>
  )
}
