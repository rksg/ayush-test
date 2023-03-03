import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  useGetLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareVersion,
  FirmwareVenueVersion,
  FirmwareCategory
} from '@acx-ui/rc/utils'


export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  let versions = getReleaseFirmware(latestReleaseVersions)
  let firmware = versions[0]
  return (
    <div>
      <div>
        {$t(
          { defaultMessage: 'Latest Version: {count}' },
          { count: firmware?.name }
        )}
      </div>
      <div>
        <span>Release </span>
        <span>(Recommended)</span>
        <span>-</span>
        <span>Dec 16, 2022</span>
      </div>
    </div>
  )
}

export default VersionBanner

const categoryIsReleaseFunc = ((lv : FirmwareVersion | FirmwareVenueVersion) =>
  lv.category === FirmwareCategory.RECOMMENDED || lv.category === FirmwareCategory.CRITICAL)

function getReleaseFirmware (firmwareVersions: FirmwareVersion[] = []): FirmwareVersion[] {
  return firmwareVersions.filter(categoryIsReleaseFunc)
}
