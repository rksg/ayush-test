import { useIntl, defineMessage } from 'react-intl'

import { Button, NoDataIconOnly } from '@acx-ui/components'
import { createSearchParams }     from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export const featureText = defineMessage({ defaultMessage:
  `This feature is a centralized algorithm that runs in the
  RUCKUS AI cloud and guarantees zero interfering links
  for the access points (APs) managed by SmartZone controllers,
  whenever theoretically achievable thus minimizing co-channel
  interference to the lowest level possible.`
})

export function NoZones () {
  const { $t } = useIntl()
  return (
    <UI.ContentWrapper>
      <p>{$t(featureText)}</p>
      <NoDataIconOnly />
      <p>{$t({ defaultMessage:
        `Currently RUCKUS AI cannot provide RRM optimizations
        as zones are not found on your network.`
      })}</p>
    </UI.ContentWrapper>
  )
}

export function NoRRMLicense () {
  const { $t } = useIntl()
  return (
    <UI.LicenseWrapper>
      <UI.ContentWrapper>
        <p>{$t(featureText)}</p>
        <p>{$t({ defaultMessage:
          `Currently RUCKUS AI cannot optimize your zone(s) for RRM due to inadequate licenses.
          Please ensure you have licenses fully applied for zone(s) for RUCKUS AI to
          optimize the RRM configuration.`
        })}</p>
      </UI.ContentWrapper>
      <Button
        size='small'
        block
        onClick={() => window.open('/analytics/admin/license', '_blank')}
        children={$t({ defaultMessage: 'Update My Licenses' })}
      />
    </UI.LicenseWrapper>
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
  const checkValues = getMesh ? 'mesh' : getGlobalZone ? 'global_zone_checker' : 'null'
  const paramString = createSearchParams({
    status: status,
    date: updatedAt,
    sliceValue: sliceValue,
    extra: checkValues
  }).toString()
  return paramString
}
