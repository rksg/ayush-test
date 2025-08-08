import { dataApiURL, store }          from '@acx-ui/store'
import { mockGraphqlQuery }           from '@acx-ui/test-utils'
import { AnalyticsFilter, DateRange } from '@acx-ui/utils'

import { IdentityFilter } from '../types'

import { api } from './services'

const payLoad: AnalyticsFilter & IdentityFilter = {
  startDate: '2025-07-06T15:12:00+08:00',
  endDate: '2025-07-07T15:12:00+08:00',
  range: DateRange.last1Hour,
  filter: {},
  identityFilter: {
    identityId: '123',
    identityGroupId: '456'
  }
}

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
              timeToConnectSLA: [ null, null ],
              clientThroughputSLA: [ null, null ]
            },
            {
              timeToConnectSLA: [ 12, 12 ],
              clientThroughputSLA: [ 3, 5 ]
            },
            {
              timeToConnectSLA: [ null, null ],
              clientThroughputSLA: [ null, null ]
            }
          ]
        }
      }
    }
  }

  describe('useIdentityHealthQuery', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'IdentityHealth', expectedResult)
      const { status, data, error } = await store.dispatch(
        api.endpoints.IdentityHealth.initiate(payLoad)
      )

      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expectedResult.data.network.hierarchyNode.health)
      expect(error).toBe(undefined)
    })

    it('should handle error', async () => {
      mockGraphqlQuery(dataApiURL, 'IdentityHealth', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.IdentityHealth.initiate(payLoad)
      )

      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).not.toBeUndefined()
    })
  })
})