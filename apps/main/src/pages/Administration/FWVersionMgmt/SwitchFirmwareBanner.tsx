import { useState } from 'react'

import { Col, Divider, Row, Space } from 'antd'
import { useIntl }                  from 'react-intl'

import { cssNumber, Tooltip }                  from '@acx-ui/components'
import { formatter, DateFormatEnum }           from '@acx-ui/formatter'
import { InformationOutlined }                 from '@acx-ui/icons'
import { FirmwareCategory, firmwareTypeTrans } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

interface FirmwareBannerProps {
  data?: VersionInfoProps[]
}

interface ShowMoreFirmwaresLinkProps {
  shownMoreFirmwaresInBanner: boolean
  setShownMoreFirmwaresInBanner: (shown: boolean) => void
}
function ShowMoreFirmwaresLink (props: ShowMoreFirmwaresLinkProps) {
  const { $t } = useIntl()
  const { shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner } = props

  return <span
    style={{
      cursor: 'pointer',
      color: 'var(--acx-accents-blue-50)',
      fontSize: cssNumber('--acx-body-4-font-size')
    }}
    onClick={() => setShownMoreFirmwaresInBanner(!shownMoreFirmwaresInBanner)}
  >
    {shownMoreFirmwaresInBanner
      ? $t({ defaultMessage: 'Show less' })
      : $t({ defaultMessage: 'Show more' })
    }
  </span>
}

export const SwitchFirmwareBanner = (props: FirmwareBannerProps) => {
  const { $t } = useIntl()
  const [ shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner ] = useState(false)

  return (
    <UI.BannerVersion>
      <Row justify='space-between' gutter={[16, 16]}>
        <Col>
          <UI.LatestVersion>
            {shownMoreFirmwaresInBanner ?
              $t({ defaultMessage: 'Recommended & Latest Version' }):
              $t({ defaultMessage: 'Recommended Version' })}
          </UI.LatestVersion>
        </Col>
        <Col>
          <ShowMoreFirmwaresLink
            shownMoreFirmwaresInBanner={shownMoreFirmwaresInBanner}
            setShownMoreFirmwaresInBanner={setShownMoreFirmwaresInBanner}
          />
        </Col>
      </Row>
      <Space split={<Divider type='vertical' style={{ height: '40px' }} />}>
        {
          props.data?.map((item, index) => <VersionInfo
            key={index}
            label={item.label}
            firmware={item.firmware}
            shownMoreFirmwaresInBanner={shownMoreFirmwaresInBanner}
          />)
        }
      </Space>
    </UI.BannerVersion>
  )
}

export interface VersionInfoProps {
  label?: string
  firmware: {
    version: string
    category: FirmwareCategory
    releaseDate?: string
    recommendedVersion?: string
    recommendedCategory?: FirmwareCategory
    recommendedDate?: string
  }
  shownMoreFirmwaresInBanner?: boolean
}

const VersionInfo = (props: VersionInfoProps) => {
  const { $t } = useIntl()
  const transform = firmwareTypeTrans($t)
  const { label, firmware, shownMoreFirmwaresInBanner } = props

  return (
    <UI.FwContainer>
      <div>
        <span>{ label } </span>
        { label?.includes('7150') && <Tooltip children={<InformationOutlined style={{
          marginBottom: '-4px',
          overflow: 'visible',
          marginLeft: '2px'
        }} />}
        // eslint-disable-next-line max-len
        title={$t({ defaultMessage: 'ICX7150-C08P/PT models do not support FastIron versions 10.0.10x.' })}
        />}
      </div>
      {shownMoreFirmwaresInBanner ? <><div>
        <span>{firmware.recommendedCategory &&
          transform(firmware.recommendedCategory, 'subType')}: </span>
        <UI.TypeSpace split={<Divider type='vertical' />}>
          <div>
            <UI.BannerVersionName>{firmware.recommendedVersion}</UI.BannerVersionName>
          </div>
          {firmware.recommendedDate &&
            formatter(DateFormatEnum.DateFormat)(firmware.recommendedDate)}
        </UI.TypeSpace>
      </div>
      <div>
        <span>{transform(firmware.category, 'type')}: </span>
        <UI.TypeSpace split={<Divider type='vertical' />}>
          <div>
            <UI.BannerVersionName>{firmware.version}</UI.BannerVersionName>
          </div>
          {firmware.releaseDate && formatter(DateFormatEnum.DateFormat)(firmware.releaseDate)}
        </UI.TypeSpace>
      </div></> :
        <div>
          <UI.BannerVersionName>{firmware.recommendedVersion}</UI.BannerVersionName>
        </div>
      }
    </UI.FwContainer>
  )
}
