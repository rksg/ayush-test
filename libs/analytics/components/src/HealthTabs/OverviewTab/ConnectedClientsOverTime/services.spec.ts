import { dataApiURL, store }    from '@acx-ui/store'
import { mockGraphqlQuery }     from '@acx-ui/test-utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import { DateRange }            from '@acx-ui/utils'

import { api } from './services'

describe('connectedClientsOverTimeApi', () => {
  const props: AnalyticsFilter = {
    startDate: '2024-03-18T00:00:00+08:00',
    endDate: '2024-03-19T00:00:00+08:00',
    range: DateRange.last24Hours,
    filter: {}
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          timeSeries: {
            time: [
              '2024-03-19T18:30:00.000Z',
              '2024-03-19T18:45:00.000Z'
            ],
            wirelessClientsCount: [
              346,
              347
            ],
            wiredClientsCount: [
              82,
              83
            ]
          }
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'HealthConnectedClientsOverTimeWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.healthConnectedClientsOverTime.initiate(
        { ...props, isSwitchHealth10010eEnabled: true } )
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.timeSeries)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthConnectedClientsOverTimeWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.healthConnectedClientsOverTime.initiate(
        { ...props, isSwitchHealth10010eEnabled: false } )
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
