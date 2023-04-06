import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { DateFormatEnum, formatter }    from '@acx-ui/formatter'
import {
  useGetSwitchLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  firmwareTypeTrans,
  FirmwareVersion,
  FirmwareVenueVersion,
  FirmwareCategory
} from '@acx-ui/rc/utils'

import * as UI from '../../styledComponents'

const transform = firmwareTypeTrans()

export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]

  if (!firmware) return null
  return (
    <div>
      <UI.BannerVersion>
        <span>{$t({ defaultMessage: 'Latest Version:' })} </span>
        <UI.BannerVersionName>{ firmware?.name.replace('_b392', '') }</UI.BannerVersionName>
      </UI.BannerVersion>
      <UI.BannerVersion>
        <span>{transform(firmware?.category, 'type')} </span>
        <span>({transform(firmware?.category, 'subType')})</span>
        <span> - </span>
        <UI.BannerVersionName>
          {formatter(DateFormatEnum.DateFormat)(firmware?.createdDate)}
        </UI.BannerVersionName>
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
