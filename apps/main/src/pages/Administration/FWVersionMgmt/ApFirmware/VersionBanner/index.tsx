import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  useGetLatestFirmwareListQuery
} from '@acx-ui/rc/services'

import { FirmwareBanner }     from '../../FirmwareBanner'
import { getReleaseFirmware } from '../../FirmwareUtils'
import { useApEolFirmware }   from '../VenueFirmwareList/useApEolFirmware'


export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]
  const { latestEolVersionByABFs } = useApEolFirmware()

  if (!firmware) return null

  const versionInfo = [
    {
      label: $t({ defaultMessage: 'For Active Device:' }),
      firmware: {
        version: firmware.name,
        category: firmware.category,
        releaseDate: firmware.onboardDate ?? firmware.createdDate
      }
    },
    ...(latestEolVersionByABFs.map(item => ({
      label: $t({ defaultMessage: 'For Legacy Device:' }),
      firmware: {
        version: item.name,
        category: item.category,
        releaseDate: item.onboardDate
      }
    })))
  ]

  return (
    <FirmwareBanner data={versionInfo} />
  )
}

export default VersionBanner
