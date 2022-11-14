import { dateRangeForLast } from './dateUtil'

describe('dateUtil', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('Should return date range for the given input', () => {
    expect(dateRangeForLast(3, 'months').toString()).toEqual(
      'Fri Oct 01 2021 00:00:00 GMT+0000,Sat Jan 01 2022 00:00:00 GMT+0000'
    )
  })
})
