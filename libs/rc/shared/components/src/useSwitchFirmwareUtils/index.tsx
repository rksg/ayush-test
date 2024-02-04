import { IntlShape } from 'react-intl'

import {
  useGetSwitchCurrentVersionsQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  FirmwareVersion,
  SortResult,
  SwitchFirmware,
  convertSwitchVersionFormat,
  firmwareTypeTrans
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

export function useSwitchFirmwareUtils () {
  const switchVersions = useGetSwitchCurrentVersionsQuery({}, {
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
      displayVersion = `${displayVersion} - ${intl.$t({ defaultMessage: 'Selected Venues are already on this release' })}`
    }
    return displayVersion
  }

  const getSwitchNextScheduleTplTooltip = (venue: FirmwareSwitchVenue): string | undefined => {
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
      }
      inUseVersions.push(v)
    })

    return inUseVersions
  }

  return {
    parseSwitchVersion,
    getSwitchVersionLabel,
    getSwitchNextScheduleTplTooltip,
    getSwitchScheduleTpl,
    getSwitchFirmwareList,
    getSwitchVenueAvailableVersions,
    sortAvailableVersionProp,
    checkCurrentVersions
  }
}
