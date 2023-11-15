import { useIntl } from 'react-intl'

import { useNavigate } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

interface NoDataWrapperProps {
  text?: string
  noData?: boolean
}

export function NoRecommendationData ({
  text, noData = false
}: NoDataWrapperProps) {
  return (
    <UI.NoRecommendationDataWrapper style={{ marginTop: noData ? '50px': 0 }}>
      <UI.TextWrapper style={{ paddingBottom: '15px' }}>
        <UI.LargeGreenTickIcon />
      </UI.TextWrapper>
      <UI.NoDataTextWrapper>
        {text}
      </UI.NoDataTextWrapper>
    </UI.NoRecommendationDataWrapper>
  )
}

export function NoAiOpsLicense ({ text }: NoDataWrapperProps) {
  const { $t } = useIntl()
  const noLicenseText = $t({ defaultMessage: 'No license' })
  const navigate = useNavigate()
  return (
    <UI.NoAILicenseWrapper>
      <div>
        <UI.TextWrapper style={{ paddingTop: '50px' }}><UI.NoDataIcon /></UI.TextWrapper>
        <UI.NoLicenseTextWrapper>{noLicenseText}</UI.NoLicenseTextWrapper>
      </div>
      <UI.NoDataTextWrapper
        style={{ paddingBottom: '100px' }}
      >{text}</UI.NoDataTextWrapper>
      <UI.LicenseButton
        type='default'
        onClick={() => {
          navigate('/analytics/admin/license')
        }}>
        {$t({ defaultMessage: 'Update my licenses' })}
      </UI.LicenseButton>
    </UI.NoAILicenseWrapper>
  )
}
