import { useState } from 'react'

import { Col, Divider, Row, Space } from 'antd'
import moment                       from 'moment'
import { useIntl }                  from 'react-intl'

import { cssNumber }                           from '@acx-ui/components'
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
      </div>
      {shownMoreFirmwaresInBanner ? <><div>
        <span>{firmware.recommendedCategory &&
          transform(firmware.recommendedCategory, 'subType')}: </span>
        <UI.TypeSpace split={<Divider type='vertical' />}>
          <div>
            <UI.BannerVersionName>{firmware.recommendedVersion}</UI.BannerVersionName>
          </div>
          {firmware.recommendedDate && moment(firmware.recommendedDate).format('MMMM DD, yyyy')}
        </UI.TypeSpace>
      </div>
      <div>
        <span>{transform(firmware.category, 'type')}: </span>
        <UI.TypeSpace split={<Divider type='vertical' />}>
          <div>
            <UI.BannerVersionName>{firmware.version}</UI.BannerVersionName>
          </div>
          {firmware.releaseDate && moment(firmware.releaseDate).format('MMMM DD, yyyy')}
        </UI.TypeSpace>
      </div></> :
        <UI.TypeSpace split={<Divider type='vertical' />}>
          <div>
            <UI.BannerVersionName>{firmware.recommendedVersion}</UI.BannerVersionName>
          </div>
          {firmware.recommendedDate && moment(firmware.recommendedDate).format('MMMM DD, yyyy')}
        </UI.TypeSpace>
      }
    </UI.FwContainer>
  )
}
