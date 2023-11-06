import { useIntl }       from 'react-intl'
import { CSSProperties } from 'styled-components'

import * as UI from './styledComponents'

interface NoDataWrapperProps {
  text?: string
  style?: CSSProperties
  recommendation?: [],
  noData?: boolean
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

export function NoRecommendationData ({ text, noData = false }: NoDataWrapperProps) {
  return (
    <UI.NoRecommendationDataWrapper style={{ marginTop: noData ? '50px': 0 }}>
      <UI.TextWrapper><UI.LargeGreenTickIcon /></UI.TextWrapper>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
    </UI.NoRecommendationDataWrapper>
  )
}

export function NoAiOpsLicense ({ text }: NoDataWrapperProps) {
  const { $t } = useIntl()
  return (
    <UI.NoAILicenseWrapper>
      <UI.NoDataTextWrapper>{text}</UI.NoDataTextWrapper>
      <UI.LicenseButton type='default'>
        {$t({ defaultMessage: 'Update my licenses' })}
      </UI.LicenseButton>
    </UI.NoAILicenseWrapper>
  )
}
