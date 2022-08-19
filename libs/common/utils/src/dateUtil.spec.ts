import moment from 'moment-timezone'

import { dateRangeForLast } from './dateUtil'

describe('dateUtil', () => {
  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })
  it('Should return date range for the given input', () => {
    expect(dateRangeForLast(3, 'months').toString()).toEqual(
      'Fri Oct 01 2021 08:00:00 GMT+0800,Sat Jan 01 2022 08:00:00 GMT+0800'
    )
  })
})
