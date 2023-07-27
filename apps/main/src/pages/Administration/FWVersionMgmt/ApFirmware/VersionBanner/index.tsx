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
  const { $t } = useIntl()
  const params = useParams()
  const { data: latestReleaseVersions } = useGetLatestFirmwareListQuery({ params })
  const versions = getReleaseFirmware(latestReleaseVersions)
  const firmware = versions[0]
  const { latestEolVersionByABFs } = useApEolFirmware()

  if (!firmware) return null

  return (
    <UI.BannerVersion>
      <UI.LatestVersion>
        {$t({ defaultMessage: 'Latest Version' })}
      </UI.LatestVersion>
      <Space split={<Divider type='vertical' style={{ height: '40px' }} />}>
        <FirmwareBanner
          key='active'
          label={$t({ defaultMessage: 'For Active Device:' })}
          firmware={firmware}
        />
        {latestEolVersionByABFs.map((abfVersion: ABFVersion) => {
          return <FirmwareBanner
            key={abfVersion.abf}
            label={$t({ defaultMessage: 'For Legacy Device:' })}
            firmware={abfVersion}
          />
        })}
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

interface FirmwareBannerProps {
  label: string
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
  const { label, firmware } = props
  const onboardDate = firmware.onboardDate ?? firmware.createdDate

  return (
    <div>
      <div>
        <span>{ label } </span>
        <UI.BannerVersionName>{firmware.name}</UI.BannerVersionName>
      </div>
      <UI.TypeSpace split={<Divider type='vertical' />}>
        <div>
          <span>{transform(firmware.category, 'type')} </span>
          <span>({transform(firmware.category, 'subType')})</span>
        </div>
        {onboardDate && formatter(DateFormatEnum.DateFormat)(onboardDate)}
      </UI.TypeSpace>
    </div>
  )
}
