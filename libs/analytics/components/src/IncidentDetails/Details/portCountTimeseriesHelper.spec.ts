import { getTimeseriesBuffer } from './portCountTimeseriesHelper'

describe('getTimeseriesBuffer', () => {
  test('should return buffer for PT3M granularity', () => {
    const start = '2023-01-01T00:00:00.000Z'
    const end = '2023-01-01T00:30:00.000Z'
    const expected = {
      front: { value: 3 * 40, unit: 'minutes' },
      back: { value: 3 * 40, unit: 'minutes' }
    }

    expect(getTimeseriesBuffer(start, end)).toEqual(expected)
  })

  test('should return buffer for PT15M granularity', () => {
    const start = '2023-01-01T00:00:00.000Z'
    const end = '2023-01-01T01:00:00.000Z'
    const expected = {
      front: { value: 15 * 8, unit: 'minutes' },
      back: { value: 15 * 8, unit: 'minutes' }
    }

    expect(getTimeseriesBuffer(start, end)).toEqual(expected)
  })

  test('should return buffer for PT30M granularity', () => {
    const start = '2023-01-01T00:00:00.000Z'
    const end = '2023-01-03T00:00:00.000Z'
    const expected = {
      front: { value: 30 * 12, unit: 'minutes' },
      back: { value: 30 * 12, unit: 'minutes' }
    }

    expect(getTimeseriesBuffer(start, end)).toEqual(expected)
  })

  test('should return default buffer for invalid granularity', () => {
    const start = '2023-01-01T00:00:00.000Z'
    const end = '2023-01-04T00:00:00.000Z'
    const expected = {
      front: { value: 60 * 6, unit: 'minutes' },
      back: { value: 60 * 6, unit: 'minutes' }
    }

    expect(getTimeseriesBuffer(start, end)).toEqual(expected)
  })
})