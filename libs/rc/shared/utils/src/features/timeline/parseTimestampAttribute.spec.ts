import { parseTimestampAttribute } from './parseTimestampAttribute'

describe('parseTimestampAttribute', () => {
  it('convert timestamp correctly', () => {
    expect(parseTimestampAttribute(undefined)).toEqual({})
    expect(parseTimestampAttribute({})).toEqual({})
    expect(parseTimestampAttribute({ aaa: '1727779016' })).toEqual({ aaa: '1727779016' })
    expect(parseTimestampAttribute({ aaaTimestamp: '1727779016000' }))
      .toEqual({ aaaTimestamp: '10/01/2024 10:36:56' })
  })
})
