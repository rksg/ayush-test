import { formatTurnOnOffTimestamp } from './formatTurnOnOffTimestamp'

describe('formatTurnOnOffTimestamp', () => {
  it('convert timestamp correctly', () => {
    expect(formatTurnOnOffTimestamp({} as Event)).toEqual({})
    expect(formatTurnOnOffTimestamp({ event_datetime: '1727779016' }))
      .toEqual({ event_datetime: '1727779016' })
    expect(formatTurnOnOffTimestamp(
      { event_datetime: '1727779016000', turnOnTimestamp: '1727779016000' }))
      .toEqual({ event_datetime: '1727779016000', turnOnTimestamp: '10/01/2024 10:36:56' })
  })
})
