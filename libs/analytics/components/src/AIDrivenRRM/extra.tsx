
import { useIntl } from 'react-intl'

import { Button }                          from '@acx-ui/components'
import { useNavigate, createSearchParams } from '@acx-ui/react-router-dom'

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

export const getParamString = (
  metadata: { audit?: [{ failure: string }] | undefined },
  status: string,
  updatedAt: string,
  sliceValue: string
) => {
  const auditMetadata = metadata as { audit?: [
    { failure: string }
  ] }
  const getMesh = auditMetadata?.audit?.some(
    data => data.failure.hasOwnProperty('mesh'))!
  const getGlobalZone = auditMetadata?.audit?.some(
    data => data.failure.hasOwnProperty('global-zone-checker'))!
  const checkValues = getMesh === true ? 'mesh'
    : getGlobalZone === true ? 'global-zone-checker' : 'null'
  const paramString = createSearchParams({
    status: status,
    date: updatedAt,
    sliceValue: sliceValue,
    extra: checkValues
  }).toString()
  return paramString
}
