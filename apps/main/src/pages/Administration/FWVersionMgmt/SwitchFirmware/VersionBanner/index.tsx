import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }    from '@acx-ui/formatter'
import {
  useGetSwitchLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareVersion,
  firmwareTypeTrans
} from '@acx-ui/rc/utils'

import { getReleaseFirmware, parseSwitchVersion } from '../../FirmwareUtils'
import * as UI                                    from '../../styledComponents'

export const VersionBanner = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions.filter(v => v.id.startsWith('090'))[0]
  const rodanFirmware = versions.filter(v => v.id.startsWith('100'))[0]
  const enableSwitchRodanFirmware = useIsSplitOn(Features.SWITCH_RODAN_FIRMWARE)

  const transform = firmwareTypeTrans($t)

  const getFirmwareInformation = function (firmware: FirmwareVersion, models: string) {
    return (<UI.FwContainer>
      <div>
        <span>{$t({ defaultMessage: 'For ICX Models ({models}):' }, { models })} </span>
        <UI.BannerVersionName>
          {parseSwitchVersion(firmware?.name)}
        </UI.BannerVersionName>
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
        {enableSwitchRodanFirmware && rodanFirmware &&
          getFirmwareInformation(rodanFirmware, '8200')}
        {firmware && getFirmwareInformation(firmware, '7150-7850')}
      </Space>
    </UI.BannerVersion>
  )
}

export default VersionBanner
