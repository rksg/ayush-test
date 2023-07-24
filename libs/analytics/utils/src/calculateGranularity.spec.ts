import moment from 'moment-timezone'

import { calculateGranularity } from './calculateGranularity'

it('should return correct granularity based on interval and min granularity', () => {
  const data = [{
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-08T00:01:00+08:00' },
    output: 'PT1H'
  }, {
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-05T00:00:00+08:00' },
    output: 'PT15M'
  }, {
    input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T00:10:00+08:00' },
    output: 'PT180S'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00', end: '2022-01-09T00:00:00+08:00', apCount: 10000
    },
    output: 'PT12H'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00', end: '2022-01-09T00:00:00+08:00', apCount: 30000
    },
    output: 'PT24H'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00', end: '2022-01-05T00:00:00+08:00', apCount: 10000
    },
    output: 'PT6H'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00', end: '2022-01-05T00:00:00+08:00', apCount: 30000
    },
    output: 'PT12H'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00', end: '2022-01-02T00:00:00+08:00', apCount: 10000
    },
    output: 'PT15M'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00', end: '2022-01-02T00:00:00+08:00', apCount: 30000
    },
    output: 'PT1H'
  }, {
    input: {
      start: '2022-01-01T00:00:00+08:00',
      end: '2022-01-01T00:10:00+08:00',
      minGranularity: 'PT15M'
    },
    output: 'PT15M'
  }]
  data.forEach(({ input, output }) => {
    expect(
      calculateGranularity(input.start, input.end, input.minGranularity, input.apCount)
    ).toStrictEqual(output)
  })
})
describe('Rollup', () => {
  const mockGet = jest.fn()
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('@acx-ui/config', () => ({ get: mockGet }))
  })
  it('Should return 1H granularity when rollup is set', () => {
    mockGet.mockReturnValue('32')
    expect(require('.').calculateGranularity(
      moment().subtract(60, 'days').format(),
      moment().format()
    )).toStrictEqual('PT1H')
  })
})
