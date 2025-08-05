import { calculateGranularity } from '@acx-ui/analytics/utils'
import { get }                  from '@acx-ui/config'
import { dataApiURL, store }    from '@acx-ui/store'
import { mockGraphqlQuery }     from '@acx-ui/test-utils'

import { mockBrandTimeseries, franchisorZones, mockAccountTiers } from './__tests__/fixtures'
import { api }                                                    from './services'

jest.mock('@acx-ui/config')

describe('services', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  const chartKeys = [
    'incident' as const,
    'compliance' as const,
    'experience' as const
  ]

  const dates = [
    {
      start: '2023-12-11T00:00:00+00:00',
      end: '2023-12-12T00:00:00+00:00'
    },
    {
      start: '2023-12-05T00:00:00+00:00',
      end: '2023-12-12T00:00:00+00:00'
    },
    {
      start: '2023-11-11T00:00:00+00:00',
      end: '2023-12-12T00:00:00+00:00'
    }
  ]

  const baseProps = {
    ssidRegex: 'DENSITY',
    start: '2023-12-11T00:00:00+00:00',
    end: '2023-12-12T00:00:00+00:00'
  }

  it('should handle fetching timeseries correctly', async () => {
    const fetchPromise = chartKeys.map(async () => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
      const { status, data, error } = await store.dispatch(
        api.endpoints.fetchBrandTimeseries.initiate({
          ...baseProps,
          tenantIds: ['1', '2']
        })
      )
      expect(error).toBeUndefined()
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockBrandTimeseries.data.franchisorTimeseries)
    })
    await Promise.all(fetchPromise)
  })

  it('should handle fetching different dates for timeseries correctly', async () => {
    const fetchPromise = dates.map(async date => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
      const { status, data, error } = await store.dispatch(
        api.endpoints.fetchBrandTimeseries.initiate({
          ...baseProps,
          ...date,
          tenantIds: []
        })
      )
      expect(error).toBeUndefined()
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockBrandTimeseries.data.franchisorTimeseries)
    })
    await Promise.all(fetchPromise)
  })

  it('should handle fetching zones correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'FranchisorZones', { data: {
      franchisorZones: franchisorZones.data
    } })
    const { status, data, error } = await store.dispatch(
      api.endpoints.fetchBrandProperties.initiate({
        ...baseProps
      })
    )
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(franchisorZones.data)
  })

  it('should handle fetching account tiers correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'GetAccountTiers', mockAccountTiers)
    const { status, data, error } = await store.dispatch(
      api.endpoints.fetchAccountTier.initiate({
        tenantIds: [
          '0541e34b28ce4daf97b602f3ec71db6e',
          'b067f6fc4c0f4da588914df68af7bca3',
          'f716a2e6a0cb424282197000fb0e8e2b'
        ]
      })
    )
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(mockAccountTiers.data.accountTiers.result)
  })

  it('should handle null accountTiers response and return empty object', async () => {
    mockGraphqlQuery(dataApiURL, 'GetAccountTiers', {
      data: { accountTiers: null }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.fetchAccountTier.initiate({
        tenantIds: ['0541e34b28ce4daf97b602f3ec71db6e']
      })
    )
    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({})
  })

  it('should calc granularity for brand360 correctly', async () => {
    const dates = [
      {
        start: '2024-03-01T00:00:00+00:00',
        end: '2024-03-01T08:00:00+00:00',
        g: 'PT15M'
      },
      {
        start: '2024-03-01T00:00:00+00:00',
        end: '2024-03-02T00:00:01+00:00',
        g: 'PT1H'
      },
      {
        start: '2024-03-01T00:00:00+00:00',
        end: '2024-03-08T08:00:00+00:00',
        g: 'PT24H'
      }
    ]
    // avoid rollup date check
    jest.mocked(get).mockReturnValue('36500')
    dates.forEach(({ start, end, g }) => {
      expect(calculateGranularity(start, end)).toEqual(g)
    })
  })
})
