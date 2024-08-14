import moment from 'moment-timezone'


jest.mock('moment-timezone', () => {
  const moment = jest.requireActual('moment-timezone')

  return {
    __esModule: true,
    ...moment,
    default: () =>moment('2024-07-13T07:35:00') // mock current date
  }
})

describe('roundUpTimeToNearest15Minutes', () => {
  it('should return if scheduledAt < currentTime + 15', () => {
    const timeString = '08:30:00'
    expect(roundUpTimeToNearest15Minutes(timeString)).toEqual(8.5)
  })
})