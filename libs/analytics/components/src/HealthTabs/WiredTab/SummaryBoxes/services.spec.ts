import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { wiredSummaryDataFixture } from './__tests__/fixtures'
import { api, RequestPayload }     from './services'

describe('Summary tile apis', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  const payload: RequestPayload = {
    filter: {},
    start: '2021-12-31T00:00:00+00:00',
    end: '2022-01-01T00:00:00+00:00'
  }
  describe('wired summary data api', () => {
    it('should return the correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'WiredSummaryQuery', { data: wiredSummaryDataFixture })
      const { status, data, error } = await store.dispatch(
        api.endpoints.wiredSummaryData.initiate(payload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(wiredSummaryDataFixture.network.hierarchyNode)
      expect(error).toBe(undefined)
    })

    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'WiredSummaryQuery', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.wiredSummaryData.initiate(payload)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })

})
