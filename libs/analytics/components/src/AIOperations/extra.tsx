import { IntlShape, useIntl } from 'react-intl'

import { Button }      from '@acx-ui/components'
import { useNavigate } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

interface NoDataWrapperProps {
  text?: string
  noData?: boolean
}

export function NoRecommendationData ({
  noData = false
}: NoDataWrapperProps) {
  const { $t } = useIntl()
  return (
    <UI.ContentWrapper $noData={noData}>
      <UI.LargeGreenTickIcon $noData={noData} />
      <p>{$t({ defaultMessage:
        `Your network is already running in an optimal configuration
        and we don’t have any AI Operations to recommend recently.`
      })}</p>
    </UI.ContentWrapper>
  )
}

export function NoAiOpsLicense () {
  const { $t } = useIntl()
  const noLicenseText = $t({ defaultMessage: 'No license' })
  const navigate = useNavigate()
  return (
    <UI.Wrapper>
      <UI.ContentWrapper $noData>
        <UI.NoDataIcon />
        <p>{noLicenseText}</p>
        <p>{$t({ defaultMessage:
          `RUCKUS AI cannot analyse your zone due to inadequate licenses.
          Please ensure you have licenses fully applied for the zone for
          AI Operations optimizations.`
        })}</p>
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

export const subtitle = ($t: IntlShape['$t']) => $t({
  defaultMessage: 'Say goodbye to manual guesswork and hello to intelligent recommendations.' })