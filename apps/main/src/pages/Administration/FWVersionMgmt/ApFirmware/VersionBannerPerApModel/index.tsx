import { useContext, useState } from 'react'

import { Col, Divider, Row, Space } from 'antd'
import { useIntl }                  from 'react-intl'

import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  ApFirmwareUpdateGroupType,
  convertApModelFirmwaresToUpdateGroups,
  ExpandableApModelList, isAlphaFilter, isAlphaOrBetaFilter, isBetaFilter,
  VersionLabelType
} from '@acx-ui/rc/components'
import { useGetAllApModelFirmwareListQuery }                from '@acx-ui/rc/services'
import { ApModelFirmware, FirmwareCategory, FirmwareLabel } from '@acx-ui/rc/utils'
import { compareVersions, noDataDisplay }                   from '@acx-ui/utils'

import * as UI               from '../../styledComponents'
import { ApFirmwareContext } from '../index'

export function VersionBannerPerApModel () {
  const { $t } = useIntl()
  const apFirmwareContext = useContext(ApFirmwareContext)
  const isApFwMgmtEarlyAccess = useIsSplitOn(Features.AP_FW_MGMT_EARLY_ACCESS_TOGGLE)
  const [ shownMoreFirmwaresInBanner, setShownMoreFirmwaresInBanner ] = useState(false)
  const { updateGroupsWithLatestVersion } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300,
    selectFromResult ({ data, isLoading }) {
      if (!data || data.length === 0 || isLoading) return { updateGroupsWithLatestVersion: [] }

      let updateGroups = []
      let updateGaGroups = convertApModelFirmwaresToUpdateGroups(
        isApFwMgmtEarlyAccess ? data.filter(d => d.labels?.includes(FirmwareLabel.GA)) : data
      )
      let updateAlphaGroups = convertApModelFirmwaresToUpdateGroups(
        data.filter(d => isAlphaFilter(d.labels))
      )
      let updateBetaGroups = convertApModelFirmwaresToUpdateGroups(
        // eslint-disable-next-line max-len
        data.filter(d => isBetaFilter(d.labels, (apFirmwareContext.isBetaFlag && !apFirmwareContext.isAlphaFlag)))
      )

      updateGroups = [
        ...updateGaGroups,
        ...(isApFwMgmtEarlyAccess && apFirmwareContext.isAlphaFlag ? updateAlphaGroups : []),
        // eslint-disable-next-line max-len
        ...(isApFwMgmtEarlyAccess && (apFirmwareContext.isBetaFlag || apFirmwareContext.isAlphaFlag) ? updateBetaGroups : [])
      ]

      updateGroups.sort((a, b) => compareVersions(b.firmwares[0].name, a.firmwares[0].name))


      updateGroups = updateGroups.map(apModelFirmware => {
        const version = apModelFirmware.firmwares[0].name
        const filteredApModels = apModelFirmware.apModels?.filter(apModel => {
          return !updateGaGroups.some(gaApModelFirmware => {
            return compareVersions(gaApModelFirmware.firmwares[0].name, version) > 0
              && gaApModelFirmware.apModels?.includes(apModel)
          })
        })

        return {
          ...apModelFirmware,
          apModels: filteredApModels
        }
      }).filter(apModelFirmware => apModelFirmware.apModels?.length > 0)

      const tenantLatestVersionUpdateGroup = extractLatestVersionToUpdateGroup(
        isApFwMgmtEarlyAccess && updateGroups.length > 0 ? [
          {
            id: updateGroups[0].firmwares[0].name,
            name: updateGroups[0].firmwares[0].name,
            category: updateGroups[0].firmwares[0].category as FirmwareCategory,
            releaseDate: updateGroups[0].firmwares[0].releaseDate as string,
            onboardDate: updateGroups[0].firmwares[0].onboardDate as string,
            supportedApModels: updateGroups[0].apModels,
            labels: updateGroups[0].firmwares[0].labels
          }
        ] : data)

      // eslint-disable-next-line max-len
      const earlyAccessFilter = (data: ApModelFirmware[], filterFn: (labels: FirmwareLabel[] | undefined) => boolean, tenantLatestVersionUpdateGroup?: ApFirmwareUpdateGroupType) => {
        const latestGA = data.find(firmware => firmware.labels?.includes(FirmwareLabel.GA))
        const compareFirmware = tenantLatestVersionUpdateGroup?.firmwares[0].name
        const result = data.filter(firmware => {
          const isLaterThanGA = compareVersions(firmware.name, latestGA?.name || '0.0.0') > 0
          // eslint-disable-next-line max-len
          const isLaterThanLatestVersion = compareFirmware ? compareVersions(firmware.name, compareFirmware) > 0 : true
          const hasEarlyAccess = filterFn(firmware.labels)

          return hasEarlyAccess && isLaterThanGA && isLaterThanLatestVersion
        })

        return result
      }

      if (updateGroups.length === 0) { // ACX-56531: At least display the latest version where there is no AP in the tenant
        if (isApFwMgmtEarlyAccess) { // if ea/iea firmware exists and larger than GA, display it
          const latestGA = data.find(firmware => firmware.labels?.includes(FirmwareLabel.GA))
          const resultAlpha = earlyAccessFilter(data, isAlphaFilter)
          const resultBeta = earlyAccessFilter(data, isBetaFilter)
          // eslint-disable-next-line max-len
          if (apFirmwareContext.isAlphaFlag && resultAlpha.length > 0) updateGroups.push(extractLatestVersionToUpdateGroup(resultAlpha.slice(0, 1)))
          // eslint-disable-next-line max-len
          if (apFirmwareContext.isBetaFlag && resultBeta.length > 0) updateGroups.push(extractLatestVersionToUpdateGroup(resultBeta.slice(0, 1)))
          if (latestGA) updateGroups.push(extractLatestVersionToUpdateGroup([latestGA]))
        } else {
          updateGroups.push(tenantLatestVersionUpdateGroup)
        }
      } else { // ACX-61022: Always display the latest version information in the banner
        const existingGroup = updateGroups.find((group: ApFirmwareUpdateGroupType) => {
          return group.firmwares[0].name === tenantLatestVersionUpdateGroup.firmwares[0].name
        })
        if (!existingGroup) {
          updateGroups.unshift(tenantLatestVersionUpdateGroup)
        }

        if (isApFwMgmtEarlyAccess) {
          const currentVersion = tenantLatestVersionUpdateGroup.firmwares[0].name
          // ACX-76973: for EA/IEA firmware, also need to display the latest version information in the banner
          const latestGA = data.find(firmware => firmware.labels?.includes(FirmwareLabel.GA))
          const resultAlpha = earlyAccessFilter(data, isAlphaFilter, tenantLatestVersionUpdateGroup)
          const resultBeta = earlyAccessFilter(data, isBetaFilter, tenantLatestVersionUpdateGroup)
          if (apFirmwareContext.isAlphaFlag && resultAlpha.length > 0
            && compareVersions(resultAlpha[0].name, currentVersion) > 0) {
            updateGroups.unshift(extractLatestVersionToUpdateGroup(resultAlpha.slice(0, 1)))
          }
          if (apFirmwareContext.isBetaFlag && resultBeta.length > 0
            && compareVersions(resultBeta[0].name, currentVersion) > 0) {
            updateGroups.unshift(extractLatestVersionToUpdateGroup(resultBeta.slice(0, 1)))
          }

          if (latestGA && compareVersions(latestGA.name, currentVersion) > 0) {
            updateGroups.unshift(extractLatestVersionToUpdateGroup([latestGA]))
          }
        }
      }

      const updateGroupsWithLatestVersion = updateGroups
        .map(item => ({ firmware: item.firmwares[0], apModels: item.apModels }))
        .sort((a, b) => compareVersions(b.firmware.name, a.firmware.name))

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
      onboardDate: latest.onboardDate,
      labels: latest.labels
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

  const generateVersionName = (firmware: VersionLabelType) => {
    if (isAlphaOrBetaFilter(firmware.labels)) {
      return `${ $t({ defaultMessage: '{name} (Early Access)' }, { name: firmware.name }) }`
    }
    return firmware.name
  }

  return (
    <UI.FwContainer>
      <Space size={0} direction='vertical'>
        <Space size={4} split={'-'}>
          <UI.BannerVersionName>{generateVersionName(firmware)}</UI.BannerVersionName>
          <span>{ formatter(DateFormatEnum.DateFormat)(firmware.releaseDate) } </span>
        </Space>
        <ExpandableApModelList apModels={apModels} generateLabelWrapper={generateLabelWrapper} />
      </Space>
    </UI.FwContainer>
  )
}
