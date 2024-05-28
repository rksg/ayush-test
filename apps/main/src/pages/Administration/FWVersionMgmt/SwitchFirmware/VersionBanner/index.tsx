import _             from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { useSwitchFirmwareUtils }       from '@acx-ui/rc/components'
import {
  useGetSwitchDefaultFirmwareListQuery,
  useGetSwitchLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import { FirmwareCategory } from '@acx-ui/rc/utils'

import { FirmwareBanner }     from '../../FirmwareBanner'
import { getReleaseFirmware } from '../../FirmwareUtils'

export const VersionBanner = () => {
  const params = useParams()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { $t } = useIntl()
  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({
    params,
    enableRbac: isSwitchRbacEnabled
  })
  const { data: defaultReleaseVersions } = useGetSwitchDefaultFirmwareListQuery({
    params,
    enableRbac: isSwitchRbacEnabled
  })
  const { parseSwitchVersion } = useSwitchFirmwareUtils()


  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions.filter(v => v.id.startsWith('090'))[0]
  const rodanFirmware = versions.filter(v => v.id.startsWith('100'))[0]



  const isDefaultVersion = function (currentVersion: string) {
    if(_.isEmpty(currentVersion)) return false
    const defaultVersions = getReleaseFirmware(defaultReleaseVersions)
    const defaultFirmware = defaultVersions.filter(v => v.id.startsWith('090'))[0]
    const defaultRodanFirmware = defaultVersions.filter(v => v.id.startsWith('100'))[0]
    return (currentVersion === defaultFirmware?.id ||
      currentVersion === defaultRodanFirmware?.id)
  }


  if (!firmware && !rodanFirmware) return null

  const versionInfo = []

  if(rodanFirmware) {
    versionInfo.push({
      label: $t({ defaultMessage: 'For ICX Models (8200):' }),
      firmware: {
        version: parseSwitchVersion(rodanFirmware?.name),
        category: isDefaultVersion(rodanFirmware?.name) ?
          FirmwareCategory.RECOMMENDED: FirmwareCategory.REGULAR,
        releaseDate: rodanFirmware?.createdDate
      }
    })
  }

  if(firmware) {
    versionInfo.push({
      label: $t({ defaultMessage: 'For ICX Models (7150-7850):' }),
      firmware: {
        version: parseSwitchVersion(firmware?.name),
        category: isDefaultVersion(firmware?.name) ?
          FirmwareCategory.RECOMMENDED: FirmwareCategory.REGULAR,
        releaseDate: firmware?.createdDate
      }
    })
  }

  return (
    <FirmwareBanner data={versionInfo} />
  )
}

export default VersionBanner

