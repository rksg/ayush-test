import React from 'react'

import moment        from 'moment'
import { IntlShape } from 'react-intl'

import {
  SwitchFirmware
} from '@acx-ui/rc/utils'

import {
  SCHEDULE_END_TIME_FORMAT,
  SCHEDULE_START_TIME_FORMAT
} from '../../FirmwareUtils'

export const enableSwitchScheduleTooltip = (s: SwitchFirmware) => {
  return s.switchNextSchedule
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
