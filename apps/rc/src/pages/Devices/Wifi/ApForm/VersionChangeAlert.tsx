import { useIntl } from 'react-intl'

import { compareVersions } from '@acx-ui/utils'

interface VersionChangeAlertProps {
  targetVenueVersion: string
  apFirmwareVersion: string
}

export function VersionChangeAlert (props: VersionChangeAlertProps) {
  const { $t } = useIntl()
  const { targetVenueVersion, apFirmwareVersion } = props

  if (compareVersions(targetVenueVersion, apFirmwareVersion) >= 0) {
    return null
  }

  return <span>{
    // eslint-disable-next-line max-len
    $t({ defaultMessage: 'Moving to this <venueSingular></venueSingular> involves a firmware version downgrade. Please consider the impact on AP stability before proceeding.' })
  }</span>
}
