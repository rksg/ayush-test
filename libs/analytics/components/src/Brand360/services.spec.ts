import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockBrandTimeseries, franchisorZones } from './__tests__/fixtures'
import { api }                                  from './services'

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
    const fetchPromise = chartKeys.map(async chartKey => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', mockBrandTimeseries)
      const { status, data, error } = await store.dispatch(
        api.endpoints.fetchBrandTimeseries.initiate({
          chartKey,
          ...baseProps
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
          chartKey: 'incident' as const,
          ...baseProps,
          ...date
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
})
