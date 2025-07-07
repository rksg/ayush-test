import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import { api } from './services'

describe('IdentityOverview services', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  const expectedResult = {
    data: {
      network: {
        hierarchyNode: {
          health: [
            {
              timeToConnectSLA: [
                null,
                null
              ],
              clientThroughputSLA: [
                null,
                null
              ]
            },
            {
              timeToConnectSLA: [
                12,
                12
              ],
              clientThroughputSLA: [
                1,
                1
              ]
            },
            {
              timeToConnectSLA: [
                null,
                null
              ],
              clientThroughputSLA: [
                null,
                null
              ]
            }
          ]
        }
      }
    }
  }

  describe('useIdentityHealthQuery', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'IdentityHealth', expectedResult)
      const { status, data, error } = await store.dispatch(api.endpoints.IdentityHealth.initiate({
        startDate: '025-07-06T15:12:00+08:00',
        endDate: '2025-07-07T15:12:00+08:00',
        range: DateRange.last1Hour,
        filter: {}
      }))

      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.data.network.hierarchyNode.health)
      expect(error).toBe(undefined)
    })

    it('should handle error', async () => {
      mockGraphqlQuery(dataApiURL, 'Traffic', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(api.endpoints.IdentityHealth.initiate({
        startDate: '2021-01-01T00:00:00+08:00',
        endDate: '2021-01-01T01:00:00+08:00',
        range: DateRange.last1Hour,
        filter: {}
      }))

      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).not.toBeUndefined()
    })
  })
})