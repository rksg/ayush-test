
import { useIntl } from 'react-intl'

import { Button }      from '@acx-ui/components'
import { useNavigate } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

interface NoDataWrapperProps {
  text: string
  details: string
}

export function NoRecommendationData ({
  text, details
}: NoDataWrapperProps) {
  const { $t } = useIntl()
  const noDataText = $t({ defaultMessage: 'No data' })
  return (
    <UI.ContentWrapper>
      <p>{text}</p>
      <UI.NoDataIcon />
      <p>{noDataText}</p>
      <p>{details}</p>
    </UI.ContentWrapper>
  )
}

export function NoRRMLicense ({ text, details }: NoDataWrapperProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  return (
    <UI.Wrapper>
      <UI.ContentWrapper>
        <p>{text}</p>
        <p>{details}</p>
      </UI.ContentWrapper>
      <Button
        type='default'
        onClick={() => {
          navigate('/analytics/admin/license')
        }}>
        {$t({ defaultMessage: 'Update my licenses' })}
      </Button>
    </UI.Wrapper>
  )
}
