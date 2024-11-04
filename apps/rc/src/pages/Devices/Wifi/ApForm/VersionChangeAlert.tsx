import { Space }   from 'antd'
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

  return <Space direction='vertical' size={'small'}>
    <span>{ // eslint-disable-next-line max-len
      $t({ defaultMessage: 'Moving to this <venueSingular></venueSingular> involves a firmware version downgrade. Please consider the impact on AP stability before proceeding.' })
    }</span>
    <span>{
      // eslint-disable-next-line max-len
      $t({ defaultMessage: 'From {existingVersion} to {targetVersion}' }, { existingVersion, targetVersion })
    }</span>
  </Space>
}
