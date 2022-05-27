import moment from 'moment-timezone'

import { last1Hour }     from './constants'
import { getDateFilter } from './globalFilterContext'

describe('getDateFilter', () => {
  beforeEach(() => {
    moment.tz.setDefault('Asia/Singapore')
    Date.now = jest.fn(() => new Date('2022-01-01T00:00:00.000Z').getTime())
  })

  it('should return correct dateFilter', () => {
    expect(getDateFilter({ range: last1Hour })).toStrictEqual({
      range: 'Last 1 Hour',
      startDate: '2022-01-01T07:00:00+08:00',
      endDate: '2022-01-01T08:00:00+08:00'
    })
  })
})
