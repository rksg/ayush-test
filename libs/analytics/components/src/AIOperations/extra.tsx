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
      <UI.NoRecommendationTopWrapper>
        <UI.LargeGreenTickIcon />
      </UI.NoRecommendationTopWrapper>
      <UI.NoRecommendationBottomWrapper>
        {text}
      </UI.NoRecommendationBottomWrapper>
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
        <UI.NoLicenseTopWrapper><UI.NoDataIcon /></UI.NoLicenseTopWrapper>
        <UI.NoLicenseTextWrapper>{noLicenseText}</UI.NoLicenseTextWrapper>
      </div>
      <UI.NoLicenseBottomWrapper>{text}</UI.NoLicenseBottomWrapper>
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
