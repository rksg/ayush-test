import { useContext, useState } from 'react'

import { Col, Divider, Row, Space } from 'antd'
import { useIntl }                  from 'react-intl'

import { DateFormatEnum, formatter }      from '@acx-ui/formatter'
import {
  ApFirmwareUpdateGroupType,
  ExpandableApModelList,
  convertApModelFirmwaresToUpdateGroups
} from '@acx-ui/rc/components'
import { VersionLabelType }                  from '@acx-ui/rc/components'
import { useGetAllApModelFirmwareListQuery } from '@acx-ui/rc/services'
import { ApModelFirmware }                   from '@acx-ui/rc/utils'
import { noDataDisplay }                     from '@acx-ui/utils'

import * as UI from '../../styledComponents'

export function VersionBannerPerApModel () {
  const { $t } = useIntl()
  const [ shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner ] = useState(false)
  const { updateGroupsWithLatestVersion } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300,
    selectFromResult ({ data, isLoading }) {
      if (!data || data.length === 0 || isLoading) return { updateGroupsWithLatestVersion: [] }

      let updateGroups = convertApModelFirmwaresToUpdateGroups(data)

      const tenantLatestVersionUpdateGroup = extractLatestVersionToUpdateGroup(data)
      if (updateGroups.length === 0) { // ACX-56531: At least display the latest version where there is no AP in the tenant
        updateGroups.push(tenantLatestVersionUpdateGroup)
      } else { // ACX-61022: Always display the latest version information in the banner
        const existingGroup = updateGroups.find((group: ApFirmwareUpdateGroupType) => {
          return group.firmwares[0].name === tenantLatestVersionUpdateGroup.firmwares[0].name
        })
        if (!existingGroup) {
          updateGroups.unshift(tenantLatestVersionUpdateGroup)
        }
      }

      const updateGroupsWithLatestVersion = updateGroups
        .map(item => ({ firmware: item.firmwares[0], apModels: item.apModels }))

      return { updateGroupsWithLatestVersion }
    }
  })

  if (updateGroupsWithLatestVersion.length === 0) return null

  const displayUpdateGroups = shownMoreFirmwaresInBanner
    ? updateGroupsWithLatestVersion
    : updateGroupsWithLatestVersion.slice(0, 1)

  return <UI.BannerVersion>
    <Row justify='space-between' gutter={[16, 16]}>
      <Col>
        <UI.LatestVersion>
          {$t({ defaultMessage: 'Latest Version' })}
        </UI.LatestVersion>
      </Col>
      { updateGroupsWithLatestVersion.length > 1 &&
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
        // eslint-disable-next-line max-len
        displayUpdateGroups.map(item => <VersionPerApModelInfo key={item.firmware.name} {...item} />)
      }
    </Space>
  </UI.BannerVersion>
}

// eslint-disable-next-line max-len
function extractLatestVersionToUpdateGroup (apModelFirmwares: ApModelFirmware[]): ApFirmwareUpdateGroupType {
  const latest = apModelFirmwares[0]

  return {
    apModels: latest.supportedApModels ?? [],
    firmwares: [{
      name: latest.name,
      category: latest.category,
      releaseDate: latest.releaseDate,
      onboardDate: latest.onboardDate
    }]
  }
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
      : $t({ defaultMessage: 'Show more' })
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
    return <span>{ $t({ defaultMessage: 'For devices {apModels}' }, { apModels: apModelsForDisplay || noDataDisplay }) }</span>
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
