import React from 'react'

import moment        from 'moment'
import { IntlShape } from 'react-intl'

import {
  FirmwareSwitchVenue,
  SortResult,
  SwitchFirmware,
  parseSwitchVersion
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import {
  SCHEDULE_END_TIME_FORMAT,
  SCHEDULE_START_TIME_FORMAT
} from '../../FirmwareUtils'

export const enableSwitchScheduleTooltip = (s: SwitchFirmware) => {
  return s.switchNextSchedule
}

export const getSwitchScheduleTpl = (s: SwitchFirmware): string | undefined => {
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

export const getSwitchNextScheduleTpl = (intl: IntlShape, s: SwitchFirmware) => {
  const schedule = s.switchNextSchedule
  if (schedule?.timeSlot?.startDateTime) {
    let endTime = moment(schedule.timeSlot.startDateTime).add(2, 'hours')
    // eslint-disable-next-line max-len
    return getDateByFormat(schedule.timeSlot.startDateTime, SCHEDULE_START_TIME_FORMAT) + ' - ' + endTime.format(SCHEDULE_END_TIME_FORMAT)
  } else {
    return intl.$t({ defaultMessage: 'Not scheduled' })
  }
}

const getDateByFormat = (date: string, format: string) => {
  return moment(date).format(format)
}


export const getHightlightSearch = function (value: string, keyword: string) {
  const parts = value.split(keyword)
  const elements = parts.map((part, index) => {
    if (index === parts.length - 1) {
      return <React.Fragment key={index}>{part}</React.Fragment>
    } else {
      return (
        <React.Fragment key={index}>
          {part}
          <b>{keyword}</b>
        </React.Fragment>
      )
    }
  })

  return <span>{elements}</span>
}

export const getSwitchFirmwareList = function (row: FirmwareSwitchVenue) {
  let versionList = []
  if (row.switchFirmwareVersion?.id) {
    versionList.push(parseSwitchVersion(row.switchFirmwareVersion.id))
  }
  if (row.switchFirmwareVersionAboveTen?.id) {
    versionList.push(parseSwitchVersion(row.switchFirmwareVersionAboveTen.id))
  }
  return versionList
}

export const getSwitchVenueAvailableVersions = function (row: FirmwareSwitchVenue) {
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

export function sortAvailableVersionProp (
  sortFn: (a: string, b: string) => SortResult
) {
  return (a: FirmwareSwitchVenue,
    b: FirmwareSwitchVenue) => {
    const valueA = getSwitchVenueAvailableVersions(a)
    const valueB = getSwitchVenueAvailableVersions(b)
    return sortFn(valueA, valueB)
  }
}
