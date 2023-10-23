import moment        from 'moment'
import { IntlShape } from 'react-intl'

import { SwitchFirmware } from '@acx-ui/rc/utils'

import { SCHEDULE_END_TIME_FORMAT, SCHEDULE_START_TIME_FORMAT, parseSwitchVersion } from '../../../FirmwareUtils'

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

