
import { getReleaseFirmware }            from '@acx-ui/rc/components'
import { useGetLatestEdgeFirmwareQuery } from '@acx-ui/rc/services'

import { FirmwareBanner } from '../../FirmwareBanner'


export const VersionBanner = () => {
  const { data: latestReleaseVersions } = useGetLatestEdgeFirmwareQuery({})
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]

  if (!firmware) return null

  const versionInfo = [{ firmware: {
    version: firmware.name,
    category: firmware.category,
    releaseDate: firmware.onboardDate
  } }]

  return (
    <FirmwareBanner data={versionInfo} />
  )
}
