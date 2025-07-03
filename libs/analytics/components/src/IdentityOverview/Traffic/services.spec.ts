import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { DateRange }         from '@acx-ui/utils'

import { api } from './services'


const mockTraffic = {
  data: {
    network: {
      hierarchyNode: {
        userRxTraffic: 100,
        userTxTraffic: 200
      }
    }
  }
}

describe('IdentityOverview services', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  describe('useTrafficQuery', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'Traffic', mockTraffic)
      const { status, data, error } = await store.dispatch(api.endpoints.Traffic.initiate({
        startDate: '2021-01-01T00:00:00+08:00',
        endDate: '2021-01-01T01:00:00+08:00',
        range: DateRange.last1Hour,
        filter: {}
      }))

      const expected = {
        userRxTraffic: 100,
        userTxTraffic: 200
      }

      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(expected)
      expect(error).toBe(undefined)
    })

    it('should handle error', async () => {
      mockGraphqlQuery(dataApiURL, 'Traffic', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(api.endpoints.Traffic.initiate({
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