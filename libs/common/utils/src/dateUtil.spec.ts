import {
  DateRange,
  dateRangeForLast,
  getDateRangeFilter,
  resetRanges,
  getCurrentDate
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
    it('corrects range input to default one', () => {
      const dateFilter = getDateRangeFilter('not valid' as DateRange)
      expect(dateFilter).toMatchObject({
        range: 'not valid',
        endDate: '2022-01-01T00:00:00+00:00',
        startDate: '2021-12-31T00:00:00+00:00'
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
})
