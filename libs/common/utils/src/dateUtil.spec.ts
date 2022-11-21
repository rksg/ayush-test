import {
  DateRange,
  dateRangeForLast,
  getDateRangeFilter,
  resetRanges,
  getShortDurationFormat,
  getUserDateFormat,
  secondToTime,
  millisToProperDuration
} from './dateUtil'


jest.spyOn(global.Date, 'now').mockImplementation(
  () => new Date('2022-01-01T00:00:00.000Z').getTime()
)

describe('dateUtil', () => {
  beforeAll(() => resetRanges())

  describe('dateRangeForLast', () => {
    it('Should return date range for the given input', () => {
      expect(dateRangeForLast(3, 'months').toString()).toEqual(
        'Fri Oct 01 2021 00:00:00 GMT+0000,Sat Jan 01 2022 00:00:00 GMT+0000'
      )
    })
  })

  describe('getDateRangeFilter', () => {
    it('should return correct range input', () => {
      const dateFilter = getDateRangeFilter(
        DateRange.last24Hours
      )

      expect(dateFilter).toMatchObject({
        range: DateRange.last24Hours,
        endDate: '2022-01-01T00:00:00+00:00',
        startDate: '2021-12-31T00:00:00+00:00'
      })
    })
  })
  it('Should return date of user date format: local time is true', () => {
    expect(getUserDateFormat('2022-11-15T06:55:55.110Z', undefined, true).toString()).toEqual(
      '11/15/2022 06:55:55'
    )
  })
  it('Should return date of user date format: local time is false', () => {
    expect(getUserDateFormat('2022-11-15T06:55:55.110Z', undefined).toString()).toEqual(
      '11/15/2022 06:55:55'
    )
  })
  it('Should return date of short duration format: > 1 minute', () => {
    expect(getShortDurationFormat(169268000).toString()).toEqual(
      '1 day, 23 hours'
    )
  })
  it('Should return date of short duration format: < 1 minute', () => {
    expect(getShortDurationFormat(500).toString()).toEqual(
      '1 minute'
    )
  })
  it('Should return duration format: empty string', () => {
    expect(secondToTime(0).toString()).toEqual(
      ''
    )
  })
  it('Should return duration format: m<=1 s>1', () => {
    expect(secondToTime(100).toString()).toEqual(
      '1m 40s'
    )
  })
  it('Should return duration format: m>1 s<1', () => {
    expect(secondToTime(180).toString()).toEqual(
      '3m 0s'
    )
  })
  it('Should return duration format: h&m > 1', () => {
    expect(secondToTime(9000).toString()).toEqual(
      '2h 30m'
    )
  })
  it('Should return duration format: h&m <= 1', () => {
    expect(secondToTime(3600).toString()).toEqual(
      '1h 0m'
    )
  })
  it('Should return duration format: d&h > 1', () => {
    expect(secondToTime(600000).toString()).toEqual(
      '6d 22h'
    )
  })
  it('Should return duration format: d&h <= 1', () => {
    expect(secondToTime(86400).toString()).toEqual(
      '1d 0h'
    )
  })
  it('Should return duration long format: days > 0', () => {
    expect(millisToProperDuration(336000000).toString()).toEqual(
      '3 Days 21 Hours'
    )
  })
  it('Should return duration long format: hours > 0', () => {
    expect(millisToProperDuration(6000000).toString()).toEqual(
      '1 Hour 40 Minutes'
    )
  })
  it('Should return duration long format: hours < 1', () => {
    expect(millisToProperDuration(86400).toString()).toEqual(
      '1 Minute 26 Seconds'
    )
  })
})
