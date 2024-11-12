import { ReactElement } from 'react'

import { Divider, Tag, Tooltip, Typography } from 'antd'
import _                                     from 'lodash'
import { IntlShape }                         from 'react-intl'

import { cssStr }                   from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { StarSolid }                from '@acx-ui/icons'
import {
  useGetSwitcDefaultVersionsQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  FirmwareVersion,
  SortResult,
  SwitchFirmware,
  convertSwitchVersionFormat,
  firmwareTypeTrans,
  compareSwitchVersion,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareVersion1002,
  FirmwareCategory,
  FirmwareSwitchV1002,
  SwitchFirmwareModelGroup,
  SwitchFirmwareV1002,
  SwitchModelGroupDisplayText,
  SwitchModelGroupDisplayTextValue,
  SwitchVersion1002
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import {
  DowngradeTag,
  RecommendedTag,
  Statistic,
  TypeSpace
} from './styledComponents'

export function useSwitchFirmwareUtils () {
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchFirmwareV1002Enabled = useIsSplitOn(Features.SWITCH_FIRMWARE_V1002_TOGGLE)
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  const switchVersions = useGetSwitcDefaultVersionsQuery({
    enableRbac: isSwitchRbacEnabled || isSwitchFirmwareV1002Enabled,
    customHeaders: isSwitchFirmwareV1002Enabled ? {
      'Content-Type': 'application/vnd.ruckus.v1.1+json',
      'Accept': 'application/vnd.ruckus.v1.1+json'
    } : {}
  }, {
    refetchOnMountOrArgChange: false
  })


  const parseSwitchVersion = (version: string) => {
    const defaultVersion = switchVersions?.data?.generalVersions

    if (defaultVersion?.includes(version)) {
      return convertSwitchVersionFormat(version.replace(/_[^_]*$/, ''))
    }
    return convertSwitchVersionFormat(version)
  }

  const getVersionOptionV1002 = (intl: IntlShape, v: SwitchVersion1002, note?: React.ReactNode) => {
    return <span style={{ lineHeight: '20px', fontSize: 'var(--acx-body-3-font-size)' }}>
      <span style={{ marginRight: '5px' }}>
        {<TypeSpace split={<Divider type='vertical' />}>
          <div>
            {parseSwitchVersion(v.name)} {note}
          </div>
          {/* [TODO] Wait for the backend to provide the correct date. */}
          {/* {!isNaN(Date.parse(v.createdDate || '')) &&
            formatter(DateFormatEnum.DateFormat)(v.createdDate)} */}
        </TypeSpace>}
      </span>
      {getSwitchVersionTagV1002(intl, v)}
      <div style={{
        marginTop: '5px',
        fontSize: 'var(--acx-body-4-font-size)',
        color: v.inUse ? 'inherit' : 'var(--acx-neutrals-60)'
      }}>
        {getSwitchVersionLabelV1002(intl, v)}
      </div>
    </span>
  }

  const getSwitchVersionLabel = (intl: IntlShape, version: FirmwareVersion): string => {
    const transform = firmwareTypeTrans(intl.$t)
    const versionName = parseSwitchVersion(version?.name)
    const versionType = transform(version?.category)

    let displayVersion = `${versionName} (${versionType})`
    if(version.inUse){
      // eslint-disable-next-line max-len
      displayVersion = `${displayVersion} - ${intl.$t({ defaultMessage: 'Selected <VenuePlural></VenuePlural> are already on this release' })}`
    }
    return displayVersion
  }
  const getSwitchVersionTagV1002 =
  (intl: IntlShape, version: FirmwareVersion): React.ReactNode => {
    return (<>
      {(version?.category === FirmwareCategory.RECOMMENDED) &&
        <RecommendedTag>
          <StarSolid
            style={{
              color: cssStr('--acx-semantics-yellow-40'),
              width: '16px',
              height: '16px',
              marginRight: '5px',
              marginBottom: '-3px'
            }}
          />
          <span>{intl.$t({ defaultMessage: 'Recommended' })}</span>
        </RecommendedTag>}
      {(version.isDowngradeVersion || version.isDowngraded10to90) && !version.inUse &&
        <DowngradeTag>{intl.$t({ defaultMessage: 'Downgrade' })}</DowngradeTag>}
    </>)
  }

  const getSwitchVersionLabelV1002 =
    (intl: IntlShape, version: FirmwareVersion): string | undefined => {
      if (version.inUse) {
        // eslint-disable-next-line max-len
        return `${intl.$t({ defaultMessage: 'Selected <VenuePlural></VenuePlural> are already on this release' })}`
      } else if (version.isDowngraded10to90) {
        // eslint-disable-next-line max-len
        return `${intl.$t({ defaultMessage: 'If selected, switches will be downgraded to version 09.0.10x Router image' })}`
      }
      return ''
    }

  const getSwitchNextScheduleTplTooltip =
   (venue: FirmwareSwitchVenue): string | undefined => {
     if (venue.nextSchedule) {
       const versionName = venue.nextSchedule.version?.name
       const versionAboveTenName = venue.nextSchedule.versionAboveTen?.name
       let names = []

       if (versionName) {
         names.push(parseSwitchVersion(versionName))
       }

       if (versionAboveTenName) {
         names.push(parseSwitchVersion(versionAboveTenName))
       }
       return names.join(', ')
     }
     return ''
   }

  const getSwitchNextScheduleTplTooltipV1002 = (intl: IntlShape,
    venue: FirmwareSwitchVenueV1002,
    currentSchedule: string
  ) => {
    if (venue.nextSchedule?.supportModelGroupVersions) {
      const supportModelGroupVersions = venue.nextSchedule?.supportModelGroupVersions
      let tooltipText: ReactElement[] = []
      const modelGroupDisplayText: { [key in SwitchFirmwareModelGroup]: string } = {
        [SwitchFirmwareModelGroup.ICX71]: intl.$t({ defaultMessage: 'ICX Models (7150)' }),
        [SwitchFirmwareModelGroup.ICX7X]: intl.$t({ defaultMessage: 'ICX Models (7550-7850)' }),
        [SwitchFirmwareModelGroup.ICX81]: intl.$t({ defaultMessage: 'ICX Models (8100)' }),
        [SwitchFirmwareModelGroup.ICX82]: intl.$t({ defaultMessage: 'ICX Models (8200)' })
      }

      for (const key in SwitchFirmwareModelGroup) {
        if(!isSupport8100 && key === SwitchFirmwareModelGroup.ICX81) {
          continue
        }
        const modelGroupVersions = supportModelGroupVersions?.filter(
          (v => v.modelGroup === key))
        if (modelGroupVersions.length > 0) {
          const { modelGroup, version } = modelGroupVersions[0]
          const modelGroupText = modelGroupDisplayText[modelGroup]
          const switchVersion = parseSwitchVersion(version)

          tooltipText.push(
            <li style={{ listStyle: 'disc', marginTop: '5px' }}
              key={modelGroup} >
              <div>
                {`${modelGroupText}`}
              </div>
              <div style={{ color: '#c4c4c4' }}> {switchVersion} </div>
            </li>
          )
        }
      }

      return <div>
        <div style={{ color: '#c4c4c4', marginBottom: '5px' }}> {currentSchedule} </div>
        <ul>{tooltipText}</ul></div>
    }
    return ''
  }

  const getSwitchDrawerNextScheduleTpl =
   (intl: IntlShape, venue: FirmwareSwitchVenueV1002) => {
     if (venue.nextSchedule?.supportModelGroupVersions) {
       const supportModelGroupVersions = venue.nextSchedule?.supportModelGroupVersions
       let tooltipText: ReactElement[] = []
       const modelGroupDisplayText: { [key in SwitchFirmwareModelGroup]: string } = {
         [SwitchFirmwareModelGroup.ICX71]: intl.$t({ defaultMessage: 'ICX Models (7150)' }),
         [SwitchFirmwareModelGroup.ICX7X]: intl.$t({ defaultMessage: 'ICX Models (7550-7850)' }),
         [SwitchFirmwareModelGroup.ICX81]: intl.$t({ defaultMessage: 'ICX Models (8100)' }),
         [SwitchFirmwareModelGroup.ICX82]: intl.$t({ defaultMessage: 'ICX Models (8200)' })
       }

       for (const key in SwitchFirmwareModelGroup) {
         if(!isSupport8100 && key === SwitchFirmwareModelGroup.ICX81) {
           continue
         }
         const modelGroupVersions = supportModelGroupVersions?.filter(
           (v => v.modelGroup === key))
         if (modelGroupVersions.length > 0) {
           const { modelGroup, version } = modelGroupVersions[0]
           const modelGroupText = modelGroupDisplayText[modelGroup]
           const switchVersion = parseSwitchVersion(version)

           tooltipText.push(
             <li style={{ listStyle: 'disc' }}
               key={modelGroup}>
               <div key={modelGroup}
                 style={{
                 }}>
                 <Typography.Text>
                   <b style={{ paddingRight: '5px' }}>
                     {modelGroupText}:</b>
                   {switchVersion}
                 </Typography.Text>
               </div>
             </li>
           )
         }
       }

       return <div><ul>{tooltipText}</ul></div>
     }
     return ''
   }

  const getSwitchDrawerVenueScheduleArray =
    (venue: FirmwareSwitchVenueV1002) => {
      if (venue.nextSchedule?.supportModelGroupVersions) {
        const supportModelGroupVersions = venue.nextSchedule?.supportModelGroupVersions
        let tooltipText: string[] = []

        for (const key in SwitchFirmwareModelGroup) {
          const modelGroupVersions = supportModelGroupVersions?.filter(
            (v => v.modelGroup === key))
          if (modelGroupVersions.length > 0) {
            const { version } = modelGroupVersions[0]
            const switchVersion = parseSwitchVersion(version)

            tooltipText.push(
              switchVersion
            )
          }
        }

        return tooltipText
      }
      return []
    }

  const getSwitchScheduleTpl = (s: SwitchFirmware): string | undefined => {
    if (s.switchNextSchedule) {
      const versionName = s.switchNextSchedule.version?.name
      const versionAboveTenName = s.switchNextSchedule.versionAboveTen?.name
      let names = []

      if (versionName) {
        names.push(parseSwitchVersion(versionName))
      }

      if (versionAboveTenName) {
        names.push(parseSwitchVersion(versionAboveTenName))
      }
      return names.join(', ')
    }
    return ''
  }
  const getSwitchScheduleTplV1002 = (s: SwitchFirmwareV1002): string => {
    const version = s.switchNextSchedule?.version || ''
    return _.isString(version) ? parseSwitchVersion(version) : version
  }

  const getSwitchFirmwareList = function (row: FirmwareSwitchVenue) {
    let versionList = []
    if (row.switchFirmwareVersion?.id) {
      versionList.push(parseSwitchVersion(row.switchFirmwareVersion.id))
    }
    if (row.switchFirmwareVersionAboveTen?.id) {
      versionList.push(parseSwitchVersion(row.switchFirmwareVersionAboveTen.id))
    }
    return versionList
  }

  const getSwitchVenueAvailableVersions = function (row: FirmwareSwitchVenue) {
    const { availableVersions } = row
    if (!Array.isArray(availableVersions) || availableVersions.length === 0) {
      return noDataDisplay
    }

    const availableVersionList = availableVersions.map(version =>
      parseSwitchVersion(version.id))
    const switchFirmwareList = getSwitchFirmwareList(row)

    const filteredArray = availableVersionList.filter(value =>
      !switchFirmwareList.includes(value))

    return filteredArray.length > 0 ? filteredArray.join(',') : noDataDisplay
  }

  const sortAvailableVersionProp = function (
    sortFn: (a: string, b: string) => SortResult
  ) {
    return (a: FirmwareSwitchVenue,
      b: FirmwareSwitchVenue) => {
      const valueA = getSwitchVenueAvailableVersions(a)
      const valueB = getSwitchVenueAvailableVersions(b)
      return sortFn(valueA, valueB)
    }
  }
  const checkCurrentVersionsV1002 = function (
    selectedVersion: FirmwareSwitchVenueV1002 | FirmwareSwitchV1002,
    availableVersions: SwitchFirmwareVersion1002[],
    defaultVersions: SwitchFirmwareVersion1002[]) {
    const defaultVersion = switchVersions?.data?.generalVersions
    const getParseVersion = function (version: string) {
      if (defaultVersion?.includes(version)) {
        return version.replace(/_[^_]*$/, '')
      }
      return version
    }
    let filterVersions = availableVersions.map(availableVersion => {

      const versions = availableVersion.versions?.map(v => {
        const inUseVersion = selectedVersion?.versions.find(
          sc => sc.modelGroup === availableVersion.modelGroup)?.version || ''
        const recommendedVersions = defaultVersions.find(
          sc => sc.modelGroup === availableVersion.modelGroup)?.versions.map(v=>v.id)
        const category = recommendedVersions?.includes(v.id) ?
          FirmwareCategory.RECOMMENDED : FirmwareCategory.REGULAR

        return {
          ...v,
          inUse: (getParseVersion(v.id) === getParseVersion(inUseVersion)) ? true : v.inUse,
          isDowngradeVersion: isDowngradeVersionV1002(inUseVersion, v.id) ?
            true : v.isDowngradeVersion,
          isDowngraded10to90: getIsDowngraded10to90(inUseVersion, v.id) ?
            true : v.isDowngraded10to90,
          category
        }
      })

      return {
        modelGroup: availableVersion.modelGroup,
        switchCount: (availableVersion.switchCount || 0) +
          (selectedVersion.switchCounts?.find(
            sc => sc.modelGroup === availableVersion.modelGroup)?.count || 0),
        versions: versions
      }
    })

    return filterVersions

  }


  const checkCurrentVersions = function (version: string, rodanVersion: string,
    filterVersions: FirmwareVersion[]): FirmwareVersion[] {
    const defaultVersion = switchVersions?.data?.generalVersions
    const getParseVersion = function (version: string) {
      if (defaultVersion?.includes(version)) {
        return version.replace(/_[^_]*$/, '')
      }
      return version
    }
    let inUseVersions = [] as FirmwareVersion[]

    filterVersions.forEach((v: FirmwareVersion) => {
      if (getParseVersion(v.id) === getParseVersion(version) ||
        getParseVersion(v.id) === getParseVersion(rodanVersion)) {
        v = { ...v, inUse: true }
      } else if (isDowngradeVersion(v.id, version, rodanVersion)) {
        v = { ...v, isDowngradeVersion: true }
      }
      inUseVersions.push(v)
    })

    return inUseVersions
  }

  function isDowngradeVersion (inUseVersion: string, version: string, rodanVersion: string) {
    if (inUseVersion.includes('090')) {
      return compareSwitchVersion(version, inUseVersion) > 0
    } else if (inUseVersion.includes('100')) {
      return compareSwitchVersion(rodanVersion, inUseVersion) > 0
    }
    return false
  }

  function isDowngradeVersionV1002 (inUseVersion: string, version: string) {
    return compareSwitchVersion(inUseVersion, version) > 0
  }

  function getIsDowngraded10to90 (inUseVersion: string, version: string) {
    if(inUseVersion?.includes('100') && version?.includes('090')) {
      return true
    }
    return false
  }

  function checkSwitchModelGroup (switchModel: string) {
    if (switchModel?.includes(SwitchFirmwareModelGroup.ICX71)) {
      return SwitchFirmwareModelGroup.ICX71
    }

    if (switchModel?.includes(SwitchFirmwareModelGroup.ICX82)) {
      return SwitchFirmwareModelGroup.ICX82
    }

    if (switchModel?.includes(SwitchFirmwareModelGroup.ICX81)) {
      return SwitchFirmwareModelGroup.ICX81
    }

    return SwitchFirmwareModelGroup.ICX7X
  }

  function getCurrentFirmwareDisplay (
    intl: IntlShape,
    row: FirmwareSwitchVenueV1002,
    contentValueWidthToDeduct?: number
  ) {

    let currentVersionDisplay = []
    let tooltipArray = []

    for (const key in SwitchFirmwareModelGroup) {
      if(!isSupport8100 && key === SwitchFirmwareModelGroup.ICX81) {
        continue
      }
      const index = Object.keys(SwitchFirmwareModelGroup).indexOf(key)
      const modelGroupValue =
        SwitchFirmwareModelGroup[key as keyof typeof SwitchFirmwareModelGroup]
      const versionGroup = row?.versions?.filter(
        (v: { modelGroup: SwitchFirmwareModelGroup }) => v.modelGroup === modelGroupValue)[0]

      if (versionGroup) {
        const modelGroupTooltipText = SwitchModelGroupDisplayText[modelGroupValue]
        const modelGroupText = SwitchModelGroupDisplayTextValue[modelGroupValue]
        const switchVersion = parseSwitchVersion(versionGroup.version)
        const tooltipMargin = index === 0 ||
          index === tooltipArray.length - 1 ? '5px 0px' : '10px 0px'

        currentVersionDisplay.push(
          <Statistic
            key={modelGroupValue}
            contentValueWidthToDeduct={_.isNumber(contentValueWidthToDeduct) ?
              contentValueWidthToDeduct : 10}
            width={modelGroupValue === SwitchFirmwareModelGroup.ICX7X ? 110 : 100}
            title={<Tag style={{
              fontSize: '10px',
              borderRadius: '8px',
              lineHeight: 'initial',
              height: '16px'
            }}>{modelGroupText}</Tag>}
            value={switchVersion}
            valueStyle={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }} />
        )

        tooltipArray.push(
          <div key={modelGroupValue}
            style={{
              margin: tooltipMargin
            }}>
            <div style={{ color: '#c4c4c4' }}>
              {`${intl.$t({ defaultMessage: 'ICX Models' })} ${modelGroupTooltipText}`}
            </div>
            <div> {switchVersion} </div>
          </div>
        )
      }
    }

    return currentVersionDisplay.length > 0 ?
      <Tooltip title={<div>{tooltipArray}</div>} placement='bottom' >
        <div style={{ display: 'flex' }}>{currentVersionDisplay}</div>
      </Tooltip> : noDataDisplay
  }

  return {
    parseSwitchVersion,
    getVersionOptionV1002,
    getSwitchVersionLabel,
    getSwitchVersionLabelV1002,
    getSwitchVersionTagV1002,
    getSwitchNextScheduleTplTooltip,
    getSwitchNextScheduleTplTooltipV1002,
    getSwitchDrawerNextScheduleTpl,
    getSwitchScheduleTpl,
    getSwitchScheduleTplV1002,
    getSwitchFirmwareList,
    getSwitchVenueAvailableVersions,
    sortAvailableVersionProp,
    checkCurrentVersions,
    checkCurrentVersionsV1002,
    isDowngradeVersion,
    getCurrentFirmwareDisplay,
    checkSwitchModelGroup,
    getSwitchDrawerVenueScheduleArray
  }
}
