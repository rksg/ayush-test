/* eslint-disable max-len */
import { rest } from 'msw'

import * as config from '@acx-ui/config'
import {
  waitFor,
  mockServer
} from '@acx-ui/test-utils'

import { SchedulerTypeEnum } from './models/SchedulerTypeEnum'
import {
  getSchedulingCustomTooltip,
  fetchVenueTimeZone,
  getCurrentTimeSlotIndex
} from './schedule.utils'


describe('Test schedule.utils', () => {

  afterEach(()=>{
    jest.useRealTimers()
  })

  it('fetchVenueTimeZone and getCurrentTimeSlotIndex', async () => {

    const callBackSpy = jest.fn()

    const timezoneRes = { // location=-37.8145092,144.9704868
      dstOffset: 0,
      rawOffset: 36000,
      status: 'OK',
      timeZoneId: 'Australia/Melbourne',
      timeZoneName: 'Australian Eastern Standard Time'
    }

    mockServer.use(
      rest.get(
        'https://maps.googleapis.com/maps/api/timezone/json',
        (req, res, ctx) => res(ctx.json(timezoneRes))
      ),
      rest.get('/env.json', (_, r, c) => r(c.json({
        GOOGLE_MAPS_KEY: 'FAKE_GOOGLE_MAPS_KEY'
      })))
    )

    await config.initialize()

    jest.useFakeTimers()

    // Australian Eastern Standard Time
    jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00')))
    const latitude = '-37.8145092'
    const longitude = '144.9704868'

    fetchVenueTimeZone(Number(latitude), Number(longitude))
      .then(timeZone => {
        const slotIndex = getCurrentTimeSlotIndex(timeZone)
        callBackSpy(slotIndex)
      })

    await waitFor(() => expect(callBackSpy).toHaveBeenCalledWith({
      day: 'Thu',
      timeIndex: 5
    }))

  })

  it('getSchedulingCustomTooltip (today)', async () => {
    const scheduleData = {
      type: SchedulerTypeEnum.CUSTOM,
      sun: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      mon: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      thu: '000000000000000000000000000000000000000111111111111111111111111111111111111111111111111111111111',
      fri: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      sat: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    }
    const currentTimeSlotIndex = {
      day: 'Thu',
      timeIndex: 5
    }

    const [dayName, timeString] = getSchedulingCustomTooltip(scheduleData, currentTimeSlotIndex)
    expect(dayName).toBe('')
    expect(timeString).toBe('09:45 AM')
    // Currently off. Scheduled to turn on at 09:45 AM
  })

  it('getSchedulingCustomTooltip (next week)', async () => {
    const scheduleData = {
      type: SchedulerTypeEnum.CUSTOM,
      sun: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      mon: '111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000',
      tue: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      wed: '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      thu: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      fri: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
      sat: '111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
    }
    const currentTimeSlotIndex = {
      day: 'Thu',
      timeIndex: 5
    }

    const [dayName, timeString] = getSchedulingCustomTooltip(scheduleData, currentTimeSlotIndex)
    expect(dayName).toBe('Monday ')
    expect(timeString).toBe('12:00 PM')
    // Scheduled to be on until Monday 12:00 PM
  })
})
