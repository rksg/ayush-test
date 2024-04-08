/* eslint-disable max-len */
import tz_lookup from '@photostructure/tz-lookup'
import moment    from 'moment-timezone'

import { NetworkVenueScheduler } from '../../models/NetworkVenueScheduler'

interface ITimeZone {
  dstOffset: number
  rawOffset: number
  status?: string
  timeZoneId: string
  timeZoneName: string
}

export interface ISlotIndex {
  day: string,
  timeIndex: number
}

const getCurrentDateWithOffset = (timeOffset: number) => {
  const today = moment.utc().utcOffset(timeOffset / 60)

  return {
    day: today.weekday(),
    hour: today.hours(),
    min: today.minutes()
  }
}

const dayList = moment.weekdaysShort() // ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const getCurrentTimeSlotIndex = (timeZone?: ITimeZone): ISlotIndex => {
  const timeOffset = timeZone ? timeZone.rawOffset + timeZone.dstOffset : 0
  const today = getCurrentDateWithOffset(timeOffset)

  const day = dayList[today.day]
  const timeIndex = today.hour * 4 + Math.floor(today.min / 15)

  return { day, timeIndex }
}

export const getVenueTimeZone = (lat: number, lng: number): ITimeZone => {
  const timeZoneId = tz_lookup(lat, lng)
  const timeZoneName = moment.utc().tz(timeZoneId).zoneAbbr()
  const rawOffset = moment.utc().tz(timeZoneId).utcOffset()*60
  return {
    timeZoneId, timeZoneName: `${timeZoneId} ${timeZoneName}`,
    rawOffset, dstOffset: 0,
    status: 'OK'
  }
}

const convertTimeFromScheduleIndex = (scheduleTimeIndex: number) => {
  const minute = (scheduleTimeIndex % 4) * 15
  let hour = Math.floor(scheduleTimeIndex / 4)
  let suffix = ' AM'

  if (hour >= 12) {
    suffix = ' PM'
    hour = hour - 12
  }

  if (hour === 0) { // 0 AM => 12 AM
    hour = 12
  }

  const hourString = String(hour).padStart(2, '0')
  const minuteString = String(minute).padStart(2, '0')

  return hourString + ':' + minuteString + suffix
}

const findIndexByStatus = (
  scheduleData: NetworkVenueScheduler, targetStatus: string, startDayIndex: number, startTimeIndex: number
) => {
  const dayLen = dayList.length
  let dayIndex: number = startDayIndex
  let timeIndex: number

  // check current day first
  let day = dayList[dayIndex]
  let dayData = scheduleData[day.toLowerCase() as keyof NetworkVenueScheduler]
  for (timeIndex = startTimeIndex; timeIndex < 96; timeIndex++) {
    if (dayData?.charAt(timeIndex) === targetStatus) {
      return { dayIndex, timeIndex }
    }
  }

  // find in next day
  for (dayIndex = startDayIndex + 1; dayIndex < dayLen; dayIndex++) {
    day = dayList[dayIndex]
    dayData = scheduleData[day.toLowerCase() as keyof NetworkVenueScheduler]
    for (timeIndex = 0; timeIndex < 96; timeIndex++) {
      if (dayData?.charAt(timeIndex) === targetStatus) {
        return { dayIndex, timeIndex }
      }
    }
  }

  return { dayIndex: -1, timeIndex: -1 }
}

export const getSchedulingCustomTooltip = (scheduleData: NetworkVenueScheduler, currentTimeSlotIndex: ISlotIndex) => {
  const daysNames = moment.weekdays() // ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currentDay = currentTimeSlotIndex.day
  const currentDayIndex = dayList.indexOf(currentDay)

  const currentTimeIndex = currentTimeSlotIndex.timeIndex
  const dayData = scheduleData[currentDay.toLowerCase() as keyof NetworkVenueScheduler]
  const currentStatus = dayData && dayData.charAt(currentTimeIndex)
  const nextTargetStatus = (currentStatus === '1') ? '0' : '1'

  let findIndex = findIndexByStatus(scheduleData, nextTargetStatus, currentDayIndex, currentTimeIndex)

  if (findIndex.timeIndex < 0) { // find in next week
    findIndex = findIndexByStatus(scheduleData, nextTargetStatus, 0, 0)
  }

  const findDayIndex = findIndex.dayIndex
  const dayName = (currentDayIndex === findDayIndex) ? '' : daysNames[findDayIndex] + ' '
  const timeString = convertTimeFromScheduleIndex(findIndex.timeIndex)

  return [ dayName, timeString ]
}
