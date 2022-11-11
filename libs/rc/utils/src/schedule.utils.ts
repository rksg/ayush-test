/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import moment from 'moment'

import { get } from '@acx-ui/config'

import { NetworkVenue }          from './models/NetworkVenue'
import { NetworkVenueScheduler } from './models/NetworkVenueScheduler'
import { SchedulerTypeEnum }     from './models/SchedulerTypeEnum'
import { Network }               from './types'

interface ITimeZone {
  dstOffset: number
  rawOffset: number
  status: string
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

const dayList = moment.localeData('en').weekdaysShort() // ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const getCurrentTimeSlotIndex = (timeZone?: ITimeZone): ISlotIndex => {
  const timeOffset = timeZone ? timeZone.rawOffset + timeZone.dstOffset : 0
  const today = getCurrentDateWithOffset(timeOffset)

  const day = dayList[today.day]
  const timeIndex = today.hour * 4 + Math.floor(today.min / 15)

  return { day, timeIndex }
}

// TODO: use mapbox/timespace instead of Google Maps Time Zone API
export const fetchVenueTimeZone = async (lat: number, lng: number): Promise<ITimeZone> => {
  /** Timestamp is shifted to the beginning of the day to involve browser caching.
   *  Without this parameter every request has unique timestamp and considered as unique
   *  and it prevents native browser caching.
   *  Dividing by 1000 required since google api accepts seconds (not ms).
   **/
  const timestamp = (new Date()).setHours(0, 0, 0, 0) / 1000
  // We pass addContentTypeHeader= false in this case since google location API will reject the request
  // if the content type is set to application/json; charset=utf-8
  const query = [
    'location=' + lat + ',' + lng,
    'timestamp=' + timestamp,
    'key=' + get('GOOGLE_MAPS_KEY')
  ]
  const url = 'https://maps.googleapis.com/maps/api/timezone/json?' + query.join('&')

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return data
    })
    // .catch(error => {
    //   return null
    // })
}

type VenueSubset = {
  deepVenue?: NetworkVenue,
  id: string,
  activated: Network['activated']
  latitude?: string,
  longitude?: string
}

export const useScheduleSlotIndexMap = (tableData: VenueSubset[]) => {
  const [scheduleSlotIndexMap, setScheduleSlotIndexMap] = useState<Record<string,ISlotIndex>>({})

  useEffect(()=>{
    const updateVenueCurrentSlotIndexMap = async (id: string, venueLatitude?: string, venueLongitude?: string) => {
      let timeZone
      if (Number(venueLatitude) && Number(venueLongitude)) {
        timeZone = await fetchVenueTimeZone(Number(venueLatitude), Number(venueLongitude))
      }
      const slotIndex = getCurrentTimeSlotIndex(timeZone)
      setScheduleSlotIndexMap(prevSlotIndexMap => ({ ...prevSlotIndexMap, ...{ [id]: slotIndex } }))
    }

    tableData.forEach(item => {
      if ( item.activated.isActivated && item.deepVenue?.scheduler?.type === SchedulerTypeEnum.CUSTOM) {
        updateVenueCurrentSlotIndexMap(item.id, item.latitude, item.longitude)
      }
    })
  }, [tableData])

  return scheduleSlotIndexMap
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