import { Divider, Space } from 'antd'
import { useIntl }        from 'react-intl'

import { DateFormatEnum, formatter }           from '@acx-ui/formatter'
import { FirmwareCategory, firmwareTypeTrans } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

interface FirmwareBannerProps {
  data?: VersionInfoProps[]
}

export const FirmwareBanner = (props: FirmwareBannerProps) => {
  const { $t } = useIntl()

  return (
    <UI.BannerVersion>
      <UI.LatestVersion>
        {$t({ defaultMessage: 'Latest Version' })}
      </UI.LatestVersion>
      <Space split={<Divider type='vertical' style={{ height: '40px' }} />}>
        {
          props.data?.map((item, index) => <VersionInfo
            key={index}
            label={item.label}
            firmware={item.firmware}
          />)
        }
      </Space>
    </UI.BannerVersion>
  )
}

interface VersionInfoProps {
  label?: string
  firmware: {
    version: string
    category: FirmwareCategory
    releaseDate?: string
  }
}

const VersionInfo = (props: VersionInfoProps) => {
  const { $t } = useIntl()
  const transform = firmwareTypeTrans($t)
  const { label, firmware } = props

  return (
    <UI.FwContainer>
      <div>
        <span>{ label } </span>
        <UI.BannerVersionName>{firmware.version}</UI.BannerVersionName>
      </div>
      <UI.TypeSpace split={<Divider type='vertical' />}>
        <div>
          <span>{transform(firmware.category, 'type')} </span>
          <span>({transform(firmware.category, 'subType')})</span>
        </div>
        {firmware.releaseDate && formatter(DateFormatEnum.DateFormat)(firmware.releaseDate)}
      </UI.TypeSpace>
    </UI.FwContainer>
  )
}