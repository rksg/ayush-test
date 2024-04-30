import { useIntl } from 'react-intl'

import { compareVersions } from '@acx-ui/utils'

interface VersionChangeAlertProps {
  targetVersion: string
  existingVersion: string
}

export function VersionChangeAlert (props: VersionChangeAlertProps) {
  const { $t } = useIntl()
  const { targetVersion, existingVersion } = props

  if (compareVersions(targetVersion, existingVersion) >= 0) {
    return null
  }

  return <span>{
    // eslint-disable-next-line max-len
    $t({ defaultMessage: 'Moving to this venue involves a firmware version downgrade. Please consider the impact on AP stability before proceeding.' })
  }</span>
}
