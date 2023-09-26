import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  useGetSwitchLatestFirmwareListQuery
} from '@acx-ui/rc/services'

import { FirmwareBanner }                         from '../../FirmwareBanner'
import { getReleaseFirmware, parseSwitchVersion } from '../../FirmwareUtils'

export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions.filter(v => v.id.startsWith('090'))[0]
  const rodanFirmware = versions.filter(v => v.id.startsWith('100'))[0]

  if (!firmware && !rodanFirmware) return null

  const versionInfo = []

  if(rodanFirmware) {
    versionInfo.push({
      label: $t({ defaultMessage: 'For ICX Models (8200):' }),
      firmware: {
        version: parseSwitchVersion(rodanFirmware?.name),
        category: rodanFirmware?.category,
        releaseDate: rodanFirmware?.createdDate
      }
    })
  }

  if(firmware) {
    versionInfo.push({
      label: $t({ defaultMessage: 'For ICX Models (7150-7850):' }),
      firmware: {
        version: parseSwitchVersion(firmware?.name),
        category: firmware?.category,
        releaseDate: firmware?.createdDate
      }
    })
  }

  return (
    <FirmwareBanner data={versionInfo} />
  )
}

export default VersionBanner
