import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  useGetLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  firmwareTypeTrans,
  FirmwareVersion,
  FirmwareVenueVersion,
  FirmwareCategory
} from '@acx-ui/rc/utils'
import { formatter } from '@acx-ui/utils'

import * as UI from '../../styledComponents'

const transform = firmwareTypeTrans()

export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]

  return (
    <div>
      <UI.BannerVersion>
        <span>{$t({ defaultMessage: 'Latest Version:' })} </span>
        <UI.BannerVersionName>{ firmware?.name }</UI.BannerVersionName>
      </UI.BannerVersion>
      <UI.BannerVersion>
        <span>{transform(firmware?.category, 'type')} </span>
        <span>({transform(firmware?.category, 'subType')})</span>
        <span> - </span>
        { // eslint-disable-next-line max-len
          <UI.BannerVersionName>{formatter('dateFormat')(firmware?.createdDate)}</UI.BannerVersionName>}
      </UI.BannerVersion>
    </div>
  )
}

export default VersionBanner

const categoryIsReleaseFunc = ((lv : FirmwareVersion | FirmwareVenueVersion) =>
  lv.category === FirmwareCategory.RECOMMENDED || lv.category === FirmwareCategory.CRITICAL)

function getReleaseFirmware (firmwareVersions: FirmwareVersion[] = []): FirmwareVersion[] {
  return firmwareVersions.filter(categoryIsReleaseFunc)
}
