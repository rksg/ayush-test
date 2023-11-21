import { useIntl } from 'react-intl'

import { Button }      from '@acx-ui/components'
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
    <UI.ContentWrapper $noData={noData}>
      <UI.LargeGreenTickIcon $noData={noData} />
      <p>{text}</p>
    </UI.ContentWrapper>
  )
}

export function NoAiOpsLicense ({ text }: NoDataWrapperProps) {
  const { $t } = useIntl()
  const noLicenseText = $t({ defaultMessage: 'No license' })
  const navigate = useNavigate()
  return (
    <UI.Wrapper>
      <UI.ContentWrapper $noData>
        <UI.NoDataIcon />
        <p>{noLicenseText}</p>
        <p>{text}</p>
      </UI.ContentWrapper>
      <Button
        block
        type='default'
        onClick={() => navigate('/analytics/admin/license')}
        children={$t({ defaultMessage: 'Update my licenses' })}
      />
    </UI.Wrapper>
  )
}
