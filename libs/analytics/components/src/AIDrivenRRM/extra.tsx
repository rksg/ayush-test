
import { IntlShape, useIntl } from 'react-intl'

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

export const defaultText = ($t: IntlShape['$t']) => $t({ defaultMessage:
  `This feature is a centralized algorithm that runs in the
  RUCKUS Analytics cloud and guarantees zero interfering links
  for the access points (APs) managed by SmartZone controllers,
  whenever theoretically achievable thus minimizing co-channel
  interference to the lowest level possible.`
})

export const noZoneText = ($t: IntlShape['$t']) => $t({ defaultMessage:
  `Currently RUCKUS AI cannot provide RRM combinations
  as zones are not found on your network`
})

export const noLicenseText = ($t: IntlShape['$t']) => $t({ defaultMessage:
  `Currently RUCKUS AI cannot optimize your current zone
  for RRM due to inadequate licenses.`
})

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
  const checkValues = getMesh ? 'mesh' : getGlobalZone ? 'global_zone_checker' : 'null'
  const paramString = createSearchParams({
    status: status,
    date: updatedAt,
    sliceValue: sliceValue,
    extra: checkValues
  }).toString()
  return paramString
}
