import { useIntl } from 'react-intl'

import { useGetLatestEdgeFirmwareQuery } from '@acx-ui/rc/services'
import {
  FirmwareCategory,
  firmwareTypeTrans,
  LatestEdgeFirmwareVersion
} from '@acx-ui/rc/utils'
import { formatter } from '@acx-ui/utils'

import * as UI from './styledComponents'

const transform = firmwareTypeTrans()

export const VersionBanner = () => {
  const { $t } = useIntl()
  const { data: latestReleaseVersions } = useGetLatestEdgeFirmwareQuery({})
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]

  const getReleaseDate = () => {
    // eslint-disable-next-line max-len
    return `${transform(firmware?.category, 'type')}(${transform(firmware?.category, 'subType')})-${formatter('dateFormat')(firmware?.createdDate)}`
  }

  return (
    <UI.Banner>
      <div>
        {$t(
          { defaultMessage: 'Latest Version: {version}' },
          { version: firmware?.name }
        )}
      </div>
      <div>
        {getReleaseDate()}
      </div>
    </UI.Banner>
  )
}

export default VersionBanner

const categoryIsReleaseFunc = ((lv : LatestEdgeFirmwareVersion) =>
  lv.category === FirmwareCategory.RECOMMENDED || lv.category === FirmwareCategory.CRITICAL)

function getReleaseFirmware (firmwareVersions: LatestEdgeFirmwareVersion[] = [])
: LatestEdgeFirmwareVersion[] {
  return firmwareVersions.filter(categoryIsReleaseFunc)
}
