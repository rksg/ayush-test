import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  useGetSwitchLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  firmwareTypeTrans,
  FirmwareVersion,
  FirmwareVenueVersion,
  FirmwareCategory
} from '@acx-ui/rc/utils'
import { formatter } from '@acx-ui/utils'

const transform = firmwareTypeTrans()

export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]

  return (
    <div>
      <div>
        {$t(
          { defaultMessage: 'Latest Version: {count}' },
          { count: firmware?.name }
        )}
      </div>
      <div>
        <span>{transform(firmware?.category, 'type')}</span>
        <span>({transform(firmware?.category, 'subType')})</span>
        <span>-</span>
        <span>{formatter('dateFormat')(firmware?.createdDate)}</span>
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
