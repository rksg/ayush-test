import { parseTimestampAttribute } from './parseTimestampAttribute'

describe('parseTimestampAttribute', () => {
  it('convert timestamp correctly', () => {
    expect(parseTimestampAttribute({} as Event)).toEqual({})
    expect(parseTimestampAttribute({ event_datetime: '1727779016' }))
      .toEqual({ event_datetime: '1727779016' })
    expect(parseTimestampAttribute(
      { event_datetime: '1727779016000', turnOnTimestamp: '1727779016000' }))
      .toEqual({ event_datetime: '1727779016000', turnOnTimestamp: '10/01/2024 10:36:56' })
  })
})
