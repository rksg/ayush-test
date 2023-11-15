import { useIntl } from 'react-intl'

import { useNavigate } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

interface NoDataWrapperProps {
  text?: string
  details?: string
}

export function NoRecommendationData ({
  text, details
}: NoDataWrapperProps) {
  const { $t } = useIntl()
  const noDataText = $t({ defaultMessage: 'No data' })
  return (
    <UI.NoRecommendationDataWrapper>
      <UI.TopTextWrapper>
        {details}
      </UI.TopTextWrapper>
      <UI.TextWrapper><UI.NoDataIcon /></UI.TextWrapper>
      <UI.NoDataTextWrapper>{noDataText}</UI.NoDataTextWrapper>
      <UI.BottomTextWrapper>
        {text}
      </UI.BottomTextWrapper>
    </UI.NoRecommendationDataWrapper>
  )
}

export function NoRRMLicense ({ text, details }: NoDataWrapperProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  return (
    <UI.NoAILicenseWrapper>
      <UI.NoLicenseTextWrapper>
        {text}
      </UI.NoLicenseTextWrapper>
      <UI.NoLicenseDetailsWrapper>
        {details}
      </UI.NoLicenseDetailsWrapper>
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
