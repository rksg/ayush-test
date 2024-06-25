import { IntlShape } from 'react-intl'

import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
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
  SwitchFirmwareModelGroup
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

export function useSwitchFirmwareUtils () {
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isSwitchFirmwareV1002Enabled = useIsSplitOn(Features.SWITCH_FIRMWARE_V1002_TOGGLE)

  const switchVersions = useGetSwitcDefaultVersionsQuery({
    enableRbac: isSwitchRbacEnabled || isSwitchFirmwareV1002Enabled,
    customHeaders: isSwitchFirmwareV1002Enabled ? {
      'Content-Type': 'application/vnd.ruckus.v1.2+json',
      'Accept': 'application/vnd.ruckus.v1.2+json'
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

  const getSwitchNextScheduleTplTooltipV1002 =
   (intl: IntlShape, venue: FirmwareSwitchVenueV1002): string | undefined => {
     if (venue.nextSchedule?.supportModelGroupVersions) {
       const supportModelGroupVersions = venue.nextSchedule?.supportModelGroupVersions
       let tooltipText: string[] = []
       const modelGroupDisplayText: { [key in SwitchFirmwareModelGroup]: string } = {
         [SwitchFirmwareModelGroup.ICX71]: intl.$t({ defaultMessage: 'ICX Models (7150)' }),
         [SwitchFirmwareModelGroup.ICX7X]: intl.$t({ defaultMessage: 'ICX Models (7550-7850)' }),
         [SwitchFirmwareModelGroup.ICX82]: intl.$t({ defaultMessage: 'ICX Models (8200)' })
       }

       supportModelGroupVersions.forEach(v => {
         tooltipText.push(modelGroupDisplayText[v.modelGroup] + ':' + parseSwitchVersion(v.version))
       })

       return tooltipText.join('\n')
     }
     return ''
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

      const versions = availableVersion.versions.map(v => {
        const inUseVersion = selectedVersion?.versions.find(
          sc => sc.modelGroup === availableVersion.modelGroup)?.version || ''
        const recommendedVersions = defaultVersions.find(
          sc => sc.modelGroup === availableVersion.modelGroup)?.versions.map(v=>v.id)
        const category = recommendedVersions?.includes(v.id) ?
          FirmwareCategory.RECOMMENDED : FirmwareCategory.REGULAR

        return {
          ...v,
          inUse: (getParseVersion(v.id) === getParseVersion(inUseVersion)),
          isDowngradeVersion: isDowngradeVersionV1002(inUseVersion, v.id),
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
    return compareSwitchVersion(version, inUseVersion) > 0
  }

  return {
    parseSwitchVersion,
    getSwitchVersionLabel,
    getSwitchNextScheduleTplTooltip,
    getSwitchNextScheduleTplTooltipV1002,
    getSwitchScheduleTpl,
    getSwitchFirmwareList,
    getSwitchVenueAvailableVersions,
    sortAvailableVersionProp,
    checkCurrentVersions,
    checkCurrentVersionsV1002,
    isDowngradeVersion
  }
}
