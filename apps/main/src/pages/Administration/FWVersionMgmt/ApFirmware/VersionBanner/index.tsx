import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { formatter, DateFormatEnum } from '@acx-ui/formatter'
import {
  useGetAvailableABFListQuery
} from '@acx-ui/rc/services'
import {
  firmwareTypeTrans,
  FirmwareCategory,
  ABFVersion
} from '@acx-ui/rc/utils'

import * as UI              from '../../styledComponents'
import { useApEolFirmware } from '../VenueFirmwareList/useApEolFirmware'


export const VersionBanner = () => {
  const { $t } = useIntl()
  const { latestActiveVersions } = useGetAvailableABFListQuery({}, {
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data }) => {
      return {
        latestActiveVersions: data
          ? data.filter(abfVersion => abfVersion.abf === 'active')
          : []
      }
    }
  })
  const firmware = getRecommendedFirmware(latestActiveVersions)[0]
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

function getRecommendedFirmware (firmwareVersions: ABFVersion[] = []): ABFVersion[] {
  return firmwareVersions.filter((abf: ABFVersion) => {
    // eslint-disable-next-line max-len
    return abf.category === FirmwareCategory.RECOMMENDED || abf.category === FirmwareCategory.CRITICAL
  })
}

interface FirmwareBannerProps {
  label: string
  firmware: {
    name: string
    category: FirmwareCategory
    createdDate?: string
    releaseDate?: string
  }
}

const FirmwareBanner = (props: FirmwareBannerProps) => {
  const { $t } = useIntl()
  const transform = firmwareTypeTrans($t)
  const { label, firmware } = props
  const releaseDate = firmware.releaseDate ?? firmware.createdDate

  return (
    <UI.FwContainer>
      <div>
        <span>{ label } </span>
        <UI.BannerVersionName>{firmware.name}</UI.BannerVersionName>
      </div>
      <UI.TypeSpace split={<Divider type='vertical' />}>
        <div>
          <span>{transform(firmware.category, 'type')} </span>
          <span>({transform(firmware.category, 'subType')})</span>
        </div>
        {releaseDate && formatter(DateFormatEnum.DateFormat)(releaseDate)}
      </UI.TypeSpace>
    </UI.FwContainer>
  )
}
