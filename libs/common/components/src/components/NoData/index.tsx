import { useIntl }       from 'react-intl'
import { CSSProperties } from 'styled-components'

import * as UI from './styledComponents'

interface NoDataWrapperProps {
  text?: string
  style?: CSSProperties
  recommendation?: []
  noData?: boolean
  details?: string
  isCrrm?: boolean
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

const getNoData = (text: string) => {
  return <div>
    <UI.TextWrapper style={{ paddingTop: '50px' }}><UI.NoDataIcon /></UI.TextWrapper>
    <UI.NoLicenseTextWrapper>{text}</UI.NoLicenseTextWrapper>
  </div>
}

export function NoRecommendationData ({
  text, noData = false, isCrrm = false, details
}: NoDataWrapperProps) {
  const { $t } = useIntl()
  const noDataText = $t({ defaultMessage: 'No data' })
  return (
    <UI.NoRecommendationDataWrapper style={{ marginTop: noData ? '50px': 0 }}>
      {isCrrm
        ? <UI.NoDataTextWrapper style={{ color: 'var(--acx-neutrals-50)', marginTop: 20 }}>
          {details}
        </UI.NoDataTextWrapper>
        : []
      }
      <UI.TextWrapper style={{ paddingBottom: '15px' }}>
        {details
          ? getNoData(noDataText)
          : <UI.LargeGreenTickIcon />}
      </UI.TextWrapper>
      <UI.NoDataTextWrapper style={{ color: 'var(--acx-neutrals-50)' }}>
        {text}
      </UI.NoDataTextWrapper>
    </UI.NoRecommendationDataWrapper>
  )
}

export function NoAiOpsLicense ({ text }: NoDataWrapperProps) {
  const { $t } = useIntl()
  const noLicenseText = $t({ defaultMessage: 'No license' })
  return (
    <UI.NoAILicenseWrapper>
      {getNoData(noLicenseText)}
      <UI.NoDataTextWrapper style={{ paddingBottom: '100px' }}>{text}</UI.NoDataTextWrapper>
      <UI.LicenseButton type='default'>
        {$t({ defaultMessage: 'Update my licenses' })}
      </UI.LicenseButton>
    </UI.NoAILicenseWrapper>
  )
}

export function NoRRMLicense ({ text, details }: NoDataWrapperProps) {
  const { $t } = useIntl()
  return (
    <UI.NoAILicenseWrapper>
      <UI.NoDataTextWrapper
        style={{
          paddingBottom: '10px',
          paddingTop: '20px',
          color: 'var(--acx-neutrals-50)'
        }}>
        {text}
      </UI.NoDataTextWrapper>
      <UI.NoDataTextWrapper
        style={{ paddingBottom: '110px', color: 'var(--acx-neutrals-50)' }}>
        {details}
      </UI.NoDataTextWrapper>
      <UI.LicenseButton type='default'>
        {$t({ defaultMessage: 'Update my licenses' })}
      </UI.LicenseButton>
    </UI.NoAILicenseWrapper>
  )
}
