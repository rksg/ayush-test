import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { useSwitchFirmwareUtils }       from '@acx-ui/rc/components'
import { getReleaseFirmware }           from '@acx-ui/rc/components'
import {
  useGetSwitchDefaultFirmwareListQuery,
  useGetSwitchLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import { FirmwareCategory } from '@acx-ui/rc/utils'

import { SwitchFirmwareBanner } from '../../SwitchFirmwareBanner'

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

  const recommendedVersions = getReleaseFirmware(defaultReleaseVersions)
  const recommendedFirmware = recommendedVersions.filter(v => v.id.startsWith('090'))[0]
  const recommendedRodanFirmware = recommendedVersions.filter(v => v.id.startsWith('100'))[0]

  if (!firmware && !rodanFirmware) return null

  const versionInfo = []

  if(rodanFirmware) {
    versionInfo.push({
      label: $t({ defaultMessage: 'For ICX Models (8200)' }),
      firmware: {
        version: parseSwitchVersion(rodanFirmware?.name),
        category: FirmwareCategory.LATEST,
        releaseDate: rodanFirmware?.createdDate,
        recommendedVersion: parseSwitchVersion(recommendedRodanFirmware?.name),
        recommendedCategory: FirmwareCategory.RECOMMENDED,
        recommendedDate: recommendedRodanFirmware?.createdDate
      }
    })
  }

  if(firmware) {
    versionInfo.push({
      label: $t({ defaultMessage: 'For ICX Models (7150-7850)' }),
      firmware: {
        version: parseSwitchVersion(firmware?.name),
        category: FirmwareCategory.LATEST,
        releaseDate: firmware?.createdDate,
        recommendedVersion: parseSwitchVersion(recommendedFirmware?.name),
        recommendedCategory: FirmwareCategory.RECOMMENDED,
        recommendedDate: recommendedFirmware?.createdDate
      }
    })
  }

  return (
    <SwitchFirmwareBanner data={versionInfo} />
  )
}

export default VersionBanner

