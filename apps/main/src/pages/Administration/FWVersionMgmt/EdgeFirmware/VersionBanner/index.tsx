import { useIntl } from 'react-intl'

import { DateFormatEnum, formatter }     from '@acx-ui/formatter'
import { useGetLatestEdgeFirmwareQuery } from '@acx-ui/rc/services'
import {
  firmwareTypeTrans
} from '@acx-ui/rc/utils'

import { getReleaseFirmware } from '../../FirmwareUtils'

import * as UI from './styledComponents'


export const VersionBanner = () => {
  const { $t } = useIntl()
  const transform = firmwareTypeTrans($t)
  const { data: latestReleaseVersions } = useGetLatestEdgeFirmwareQuery({})
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]

  const getReleaseDate = () => {
    // eslint-disable-next-line max-len
    return `${transform(firmware?.category, 'type')}(${transform(firmware?.category, 'subType')})-${formatter(DateFormatEnum.DateFormat)(firmware?.createdDate)}`
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
