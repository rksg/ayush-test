import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'
import { useParams }      from 'react-router-dom'

import { formatter, DateFormatEnum } from '@acx-ui/formatter'
import {
  useGetLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  firmwareTypeTrans,
  FirmwareVersion,
  FirmwareVenueVersion,
  FirmwareCategory,
  ABFVersion
} from '@acx-ui/rc/utils'

import * as UI              from '../../styledComponents'
import { useApEolFirmware } from '../VenueFirmwareList/useApEolFirmware'


export const VersionBanner = () => {
  const params = useParams()
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]
  const { latestEolVersionByABFs } = useApEolFirmware()

  if (!firmware) return null

  return (
    <Space size={20} split={<Divider type='vertical' style={{ height: '40px' }} />}>
      <FirmwareBanner key='active' firmware={firmware} />
      {latestEolVersionByABFs.map((abfVersion: ABFVersion) => {
        return <FirmwareBanner key={abfVersion.abf} firmware={abfVersion} />
      })}
    </Space>
  )
}

export default VersionBanner

const categoryIsReleaseFunc = ((lv : FirmwareVersion | FirmwareVenueVersion) =>
  lv.category === FirmwareCategory.RECOMMENDED || lv.category === FirmwareCategory.CRITICAL)

function getReleaseFirmware (firmwareVersions: FirmwareVersion[] = []): FirmwareVersion[] {
  return firmwareVersions.filter(categoryIsReleaseFunc)
}

interface FirmwareBannerProps {
  firmware: {
    name: string
    category: FirmwareCategory
    onboardDate?: string
    createdDate?: string
  }
}

const FirmwareBanner = (props: FirmwareBannerProps) => {
  const { $t } = useIntl()
  const transform = firmwareTypeTrans($t)
  const { firmware } = props
  const onboardDate = firmware.onboardDate ?? firmware.createdDate

  return (
    <div>
      <UI.BannerVersion>
        <span>{$t({ defaultMessage: 'Latest Version:' })} </span>
        <UI.BannerVersionName>{ firmware.name }</UI.BannerVersionName>
      </UI.BannerVersion>
      <UI.BannerVersion>
        <span>{transform(firmware.category, 'type')} </span>
        <span>({transform(firmware.category, 'subType')})</span>
        <span> - </span>
        <UI.BannerVersionName>
          {onboardDate && formatter(DateFormatEnum.DateFormat)(onboardDate)}
        </UI.BannerVersionName>
      </UI.BannerVersion>
    </div>
  )
}
