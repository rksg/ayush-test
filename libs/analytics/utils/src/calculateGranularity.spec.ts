import moment from 'moment-timezone'

import { get }        from '@acx-ui/config'
import { isCoreTier } from '@acx-ui/user'

import { calculateGranularity } from './calculateGranularity'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

jest.mocked(get).mockReturnValue('32') // get('DRUID_ROLLUP_DAYS')

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  isCoreTier: jest.fn().mockReturnValue(false)
}))

it('should return correct granularity based on interval and min granularity', () => {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(Date.parse('2022-02-02T01:00:00+08:00')))
  const data = [
    {
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-08T00:01:00+08:00' },
      output: 'PT24H'
    },
    {
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-05T00:00:00+08:00' },
      output: 'PT1H'
    },
    {
      input: { start: '2022-01-01T00:00:00+08:00', end: '2022-01-01T00:10:00+08:00' },
      output: 'PT15M'
    },
    {
      input: {
        start: '2022-01-01T00:00:00+08:00',
        end: '2022-01-01T05:00:00+08:00',
        minGranularity: 'PT1H'
      },
      output: 'PT15M'
    }
  ]
  data.forEach(({ input, output }) => {
    expect(
      calculateGranularity(input.start, input.end)
    ).toStrictEqual(output)
  })
  jest.useRealTimers()
  jest.resetAllMocks()
})
describe('Rollup', () => {
  const mockGet = jest.fn()
  beforeEach(() => {
    jest.resetModules()
    jest.doMock('@acx-ui/config', () => ({ get: mockGet }))
  })
  it('Should return 24H granularity when rollup is set', () => {
    mockGet.mockReturnValue('32')
    expect(require('.').calculateGranularity(
      moment().subtract(60, 'days').format(),
      moment().format()
    )).toStrictEqual('PT24H')
  })
})

describe('Min Granularity Precedence', () => {
  it('Should return PT1H when minGranularity is greater than calculated granularity', () => {
    jest.mocked(get).mockReturnValue('32')
    jest.spyOn(require('.'), 'overlapsRollup').mockReturnValue(true)

    const start = '2022-01-01T00:00:00+08:00'
    const end = '2022-01-01T00:10:00+08:00'

    expect(calculateGranularity(start, end)).toStrictEqual('PT1H')
  })
})

describe('Core Tier User', () => {
  it('Should return PT1H when user is a Core Tier user even for small intervals', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2022-02-02T01:00:00+08:00')))
    jest.mocked(isCoreTier).mockReturnValue(true)

    // Small interval (10 minutes) that would normally return PT15M
    const start = '2022-01-01T00:00:00+08:00'
    const end = '2022-01-01T00:10:00+08:00'

    expect(calculateGranularity(start, end)).toStrictEqual('PT1H')

    jest.useRealTimers()
    jest.resetAllMocks()
  })
})
