import moment from 'moment-timezone'

import {
  trackDateSelection,
  DateRange,
  dateRangeForLast,
  getDateRangeFilter,
  resetRanges,
  getCurrentDate,
  computeRangeFilter,
  getDatePickerValues,
  transformTimezoneDifference,
  getVenueTimeZone
} from './dateUtil'


jest.spyOn(global.Date, 'now').mockImplementation(
  () => new Date('2022-01-01T00:00:00.000Z').getTime()
)

describe('dateUtil', () => {
  const now = new Date('2022-01-01T00:00:00.000Z').getTime()
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(now)
    resetRanges()
  })
  afterEach(() => jest.restoreAllMocks())

  describe('dateRangeForLast', () => {
    it('Should return date range for the given input', () => {
      expect(dateRangeForLast(3, 'months').toString()).toEqual(
        'Fri Oct 01 2021 00:01:00 GMT+0000,Sat Jan 01 2022 00:01:00 GMT+0000'
      )
    })
  })

  describe('getDatePickerValues', () => {
    it('returns state if not custom', () => {
      const range = DateRange.last24Hours
      expect(getDatePickerValues({
        range,
        endDate: '2023-01-01T00:01:00+00:00',
        startDate: '2022-12-31T00:01:00+00:00'
      })).toMatchObject({
        range,
        endDate: '2022-01-01T00:01:00+00:00',
        startDate: '2021-12-31T00:01:00+00:00'
      })
    })
    it('returns dates if custom', () => {
      expect(getDatePickerValues({
        range: DateRange.custom,
        endDate: '2023-01-01T00:01:00+00:00',
        startDate: '2022-12-31T00:01:00+00:00'
      })).toMatchObject({
        range: DateRange.custom,
        endDate: '2023-01-01T00:01:00+00:00',
        startDate: '2022-12-31T00:01:00+00:00'
      })
    })
  })
  describe('getDateRangeFilter', () => {
    it('should return correct range input', () => {
      const range = DateRange.last24Hours
      expect(getDateRangeFilter(range)).toMatchObject({
        range,
        endDate: '2022-01-01T00:01:00+00:00',
        startDate: '2021-12-31T00:01:00+00:00'
      })

      jest.mocked(Date.now).mockReturnValue(now + 5 * 60 * 1000)

      expect(getDateRangeFilter(range)).toMatchObject({
        range,
        endDate: '2022-01-01T00:06:00+00:00',
        startDate: '2021-12-31T00:06:00+00:00'
      })
    })
    it('corrects range input to default one', () => {
      const dateFilter = getDateRangeFilter('not valid' as DateRange)
      expect(dateFilter).toMatchObject({
        range: 'not valid',
        endDate: '2022-01-01T00:01:00+00:00',
        startDate: '2021-12-31T00:01:00+00:00'
      })
    })
  })
  describe('getCurrentDate', () => {
    it('Should return date range for the given input', () => {
      expect(getCurrentDate('YYYYMMDDHHMMSS').toString()).toEqual(
        '20220101000100'
      )
    })
  })

  describe('computeRangeFilter', () => {
    const filters = {
      abc: 'def',
      dateFilter: {
        range: DateRange.last24Hours,
        startDate: '--',
        endDate: '--'
      }
    }
    it('compute date filter', () => {
      expect(computeRangeFilter(filters)).toMatchObject({
        abc: 'def',
        startDate: '2021-12-31T00:01:00Z',
        endDate: '2022-01-01T00:01:00Z'
      })
    })
    it('allow customize field name', () => {
      expect(computeRangeFilter(filters, ['fromTime', 'toTime'])).toMatchObject({
        abc: 'def',
        fromTime: '2021-12-31T00:01:00Z',
        toTime: '2022-01-01T00:01:00Z'
      })
    })
  })

  describe('transformTimezoneDifference', () => {
    it('should return timezone difference', () => {
      expect(transformTimezoneDifference(0)).toEqual('UTC +00:00')
      expect(transformTimezoneDifference(28800)).toEqual('UTC +08:00')
      expect(transformTimezoneDifference(-3600)).toEqual('UTC -01:00')
    })
  })

  describe('trackDateSelection', () => {
    it('does not call pendo.track or throw if pendo is not defined', () => {
      trackDateSelection(DateRange.last24Hours)
    })
    it('calls pendo.track if pendo is defined', () => {
      window.pendo = {
        showGuideById: jest.fn(),
        initialize: jest.fn(),
        identify: jest.fn(),
        track: jest.fn()
      }
      const startDate = moment('2022-01-01')
      const endDate = moment('2022-01-02')
      trackDateSelection(DateRange.last24Hours, startDate, endDate)
      expect(window.pendo.track).toHaveBeenCalledWith('date-selections', {
        range: DateRange.last24Hours,
        env: 'localhost',
        url: '/',
        startDate,
        endDate
      })
    })
  })

  describe('getVenueTimeZone', () => {
    it('should return correct', async () => {

      jest.useFakeTimers()

      // Australian Eastern Standard Time
      jest.setSystemTime(new Date(Date.parse('2022-08-04T01:20:00+10:00')))
      const latitude = '-37.8145092'
      const longitude = '144.9704868'

      const timeZone = getVenueTimeZone(Number(latitude), Number(longitude))

      expect(timeZone).toStrictEqual({
        dstOffset: 0,
        rawOffset: 36000,
        timeZoneId: 'Australia/Melbourne',
        timeZoneName: 'Australia/Melbourne AEST'
      })

      jest.runOnlyPendingTimers()
    })
  })

})
