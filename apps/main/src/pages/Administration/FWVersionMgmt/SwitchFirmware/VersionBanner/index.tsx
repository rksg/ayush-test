import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

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

import * as UI from './styledComponents'

const transform = firmwareTypeTrans()

export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions.filter(v => v.id.startsWith('090'))[0]
  const rodanFirmware = versions.filter(v => v.id.startsWith('100'))[0]


  const getFirmwareInformation = function (firmware: FirmwareVersion, models: string) {
    return (<UI.FwContainer>
      <div>
        <span>{$t({ defaultMessage: 'For ICX Models ({models}):' }, { models })} </span>
        <UI.VersionName>{firmware?.name.replace('_b392', '')}</UI.VersionName>
      </div>
      <div>
        <UI.TypeSpace split={<Divider type='vertical' />}>
          <div>
            <span>{transform(firmware?.category, 'type')} </span>
            <span>({transform(firmware?.category, 'subType')})</span>
          </div>
          {formatter(DateFormatEnum.DateFormat)(firmware?.createdDate)}
        </UI.TypeSpace>
      </div>
    </UI.FwContainer>)
  }

  if (!firmware && !rodanFirmware) return null
  return (
    <UI.BannerVersion>
      <UI.LatestVersion>
        {$t({ defaultMessage: 'Latest Version' })}
      </UI.LatestVersion>
      <Space split={<Divider type='vertical' style={{ height: '40px' }} />}>
        {rodanFirmware && getFirmwareInformation(rodanFirmware, '8200')}
        {firmware && getFirmwareInformation(firmware, '7150-7850')}
      </Space>
    </UI.BannerVersion>
  )
}

export default VersionBanner

const categoryIsReleaseFunc = ((lv : FirmwareVersion | FirmwareVenueVersion) =>
  lv.category === FirmwareCategory.RECOMMENDED || lv.category === FirmwareCategory.CRITICAL)

function getReleaseFirmware (firmwareVersions: FirmwareVersion[] = []): FirmwareVersion[] {
  return firmwareVersions.filter(categoryIsReleaseFunc)
}
