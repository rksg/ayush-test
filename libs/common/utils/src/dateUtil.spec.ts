import {
  DateRange,
  dateRangeForLast,
  getDateRangeFilter,
  resetRanges,
  getCurrentDate,
  computeRangeFilter
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
        'Fri Oct 01 2021 00:00:00 GMT+0000,Sat Jan 01 2022 00:00:00 GMT+0000'
      )
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
})
