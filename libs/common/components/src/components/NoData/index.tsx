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
      <UI.TextWrapper>{text}</UI.TextWrapper>
    </UI.NoDataWrapper>
  )
}
