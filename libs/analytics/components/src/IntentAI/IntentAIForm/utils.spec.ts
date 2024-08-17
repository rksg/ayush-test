import { MomentInput } from 'moment-timezone'

import { handleScheduledAt } from './utils'


jest.mock('moment-timezone', () => {
  const moment = jest.requireActual('moment-timezone')

  return {
    __esModule: true,
    ...moment,
    default: (date: MomentInput) =>
      ( date === '2024-07-13T07:45:00+00:00') ||
      ( date === '2024-07-13T09:00:00+00:00')
        ? moment(date)
        : moment('2024-07-13T07:35:00+00:00') // mock current datetime
  }
})

describe('roundUpTimeToNearest15Minutes', () => {
  it('should return correct scheduledAt, if scheduledAt < currentTime + 15', () => {
    const actualScheduledAt = '2024-07-13T07:45:00+00:00'
    const expectedScheduledAt = '2024-07-14T07:45:00+00:00'
    expect(handleScheduledAt(actualScheduledAt)).toEqual(expectedScheduledAt)
  })
  it('should return correct scheduledAt, if scheduledAt >= currentTime + 15', () => {
    const actualScheduledAt = '2024-07-13T09:00:00+00:00'
    const expectedScheduledAt = actualScheduledAt
    expect(handleScheduledAt(actualScheduledAt)).toEqual(expectedScheduledAt)
  })
})