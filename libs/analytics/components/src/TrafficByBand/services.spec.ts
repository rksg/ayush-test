import { AnalyticsFilter }   from '@acx-ui/analytics/utils'
import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import { api } from './services'

describe('trafficByUsageWidgetApi', () => {
  const props: AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      client: {
        timeSeries: {
          time: [
            '2022-04-07T09:15:00.000Z',
            '2022-04-07T09:30:00.000Z',
            '2022-04-07T09:45:00.000Z',
            '2022-04-07T10:00:00.000Z',
            '2022-04-07T10:15:00.000Z'
          ],
          userTraffic: [1, 2, 3, 4, 5],
          userTraffic_2_4: [6, 7, 8, 9, 10],
          userTraffic_5: [11, 12, 13, 14, 15],
          userTraffic_6: [11, 12, 13, 14, 15]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'ClientTrafficByBand', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByBand.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.client.timeSeries)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'ClientTrafficByBand', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByBand.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
