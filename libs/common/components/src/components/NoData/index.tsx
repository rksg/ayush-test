import { Empty }         from 'antd'
import { useIntl }       from 'react-intl'
import { CSSProperties } from 'styled-components'

import * as UI from './styledComponents'

export interface NoDataWrapperProps {
  text?: string
  style?: CSSProperties
  tickSize?: 'default' | 'large'
}

export interface NoDataIconWrapperProps {
  iconText?: string
  text?: string
}

export function NoData ({ text, style }: NoDataWrapperProps) {
  const { $t } = useIntl()
  text = text ? text : $t({ defaultMessage: 'No data to display' })
  return (
    <UI.NoDataWrapper style={style}>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </UI.NoDataWrapper>
  )
}

export function NoActiveData ({ text, tickSize }: NoDataWrapperProps) {
  const { $t } = useIntl()
  text = text ? text : $t({ defaultMessage: 'No active data' })
  return (
    <UI.NoDataWrapper>
      <UI.TextWrapper><UI.GreenTickIcon $size={tickSize} /></UI.TextWrapper>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </UI.NoDataWrapper>
  )
}
NoActiveData.defaultProps = { tickSize: 'default' }

export function NoActiveContent ({ text, tickSize }: NoDataWrapperProps) {
  const { $t } = useIntl()
  text = text ? text : $t({ defaultMessage: 'No active data' })
  return (
    <>
      <UI.TextWrapper><UI.GreenTickIcon $size={tickSize} /></UI.TextWrapper>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </>
  )
}
NoActiveContent.defaultProps = { tickSize: 'default' }

export function NoDataIconOnly ({ iconText }: NoDataIconWrapperProps) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={iconText} />
}

export function NoDataIcon ({ iconText, text }: NoDataIconWrapperProps) {
  const { $t } = useIntl()
  text = text ? text : $t({ defaultMessage: 'No data to display' })
  return (
    <UI.NoDataWrapper>
      <UI.TextWrapper><NoDataIconOnly iconText={iconText} /></UI.TextWrapper>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </UI.NoDataWrapper>
  )
}
