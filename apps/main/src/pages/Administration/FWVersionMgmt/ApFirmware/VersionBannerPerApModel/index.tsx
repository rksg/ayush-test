import { useState } from 'react'

import { Col, Divider, Row, Space } from 'antd'
import { useIntl }                  from 'react-intl'

import { DateFormatEnum, formatter }         from '@acx-ui/formatter'
import { useGetAllApModelFirmwareListQuery } from '@acx-ui/rc/services'

import { VersionLabelType }                                             from '../../FirmwareUtils'
import * as UI                                                          from '../../styledComponents'
import { ExpandableApModelList, convertApModelFirmwaresToUpdateGroups } from '../VenueFirmwareListPerApModel/venueFirmwareListPerApModelUtils'

export function VersionBannerPerApModel () {
  const { $t } = useIntl()
  const { updateGroups } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 60,
    selectFromResult ({ data, isLoading }) {
      if (!data || isLoading) return { updateGroups: [] }

      const updateGroups = convertApModelFirmwaresToUpdateGroups(data)
        .map(item => ({ firmware: item.firmwares[0], apModels: item.apModels }))

      return { updateGroups }
    }
  })

  const [ shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner ] = useState(false)

  if (updateGroups.length === 0) return null

  return <UI.BannerVersion>
    <Row justify='space-between' gutter={[16, 16]}>
      <Col>
        <UI.LatestVersion>
          {$t({ defaultMessage: 'Latest Version' })}
        </UI.LatestVersion>
      </Col>
      { updateGroups.length > 1 &&
        <Col>
          <ShowMoreFirmwaresLink
            shownMoreFirmwaresInBanner={shownMoreFirmwaresInBanner}
            setShownMoreFirmwaresInBanner={setShownMoreFirmwaresInBanner}
          />
        </Col>
      }
    </Row>
    <Space split={<Divider type='vertical' style={{ height: '40px' }} />}>
      {
        updateGroups.filter((_, index) => shownMoreFirmwaresInBanner || index === 0)
          .map(item => <VersionPerApModelInfo key={item.firmware.name} {...item} />)
      }
    </Space>
  </UI.BannerVersion>
}

interface ShowMoreFirmwaresLinkProps {
  shownMoreFirmwaresInBanner: boolean
  setShownMoreFirmwaresInBanner: (shown: boolean) => void
}
function ShowMoreFirmwaresLink (props: ShowMoreFirmwaresLinkProps) {
  const { $t } = useIntl()
  const { shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner } = props

  return <span
    style={{ cursor: 'pointer', color: 'var(--acx-accents-blue-50)' }}
    onClick={() => setShownMoreFirmwaresInBanner(!shownMoreFirmwaresInBanner)}
  >
    {shownMoreFirmwaresInBanner
      ? $t({ defaultMessage: 'Show less' })
      : $t({ defaultMessage: 'Show more available firmware' })
    }
  </span>
}

interface VersionInfoPerApModelProps {
  firmware: VersionLabelType
  apModels: string[]
}
function VersionPerApModelInfo (props: VersionInfoPerApModelProps) {
  const { $t } = useIntl()
  const { firmware, apModels } = props

  const generateLabelWrapper = (apModelsForDisplay: string) => {
    // eslint-disable-next-line max-len
    return <span>{ $t({ defaultMessage: 'For devices {apModels}' }, { apModels: apModelsForDisplay }) }</span>
  }

  return (
    <UI.FwContainer>
      <Space size={0} direction='vertical'>
        <Space size={4} split={'-'}>
          <UI.BannerVersionName>{firmware.name}</UI.BannerVersionName>
          <span>{ formatter(DateFormatEnum.DateFormat)(firmware.releaseDate) } </span>
        </Space>
        <ExpandableApModelList apModels={apModels} generateLabelWrapper={generateLabelWrapper} />
      </Space>
    </UI.FwContainer>
  )
}
