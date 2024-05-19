import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { moreDetailsDataFixture }         from './__tests__/fixtures'
import { moreDetailsApi, RequestPayload } from './services'

describe('More Details apis', () => {
  afterEach(() =>
    store.dispatch(moreDetailsApi.util.resetApiState())
  )
  const kpis = [
    'cpu',
    'dhcp',
    'congestedPort',
    'stormPort'
  ]
  describe('more details data api', () => {
    it.each(kpis)('should return the correct data', async (type) => {
      mockGraphqlQuery(dataApiURL, 'PieChartQuery', { data: moreDetailsDataFixture })
      const payload: RequestPayload = {
        filter: {},
        start: '2021-12-31T00:00:00+00:00',
        end: '2022-01-01T00:00:00+00:00',
        n: 5,
        type
      }
      const { status, data, error } = await store.dispatch(
        moreDetailsApi.endpoints.pieChartData.initiate(payload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(moreDetailsDataFixture.network.hierarchyNode)
      expect(error).toBe(undefined)
    })

    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'PieChartQuery', {
        error: new Error('something went wrong!')
      })
      const payload: RequestPayload = {
        filter: {},
        start: '2021-12-31T00:00:00+00:00',
        end: '2022-01-01T00:00:00+00:00',
        n: 5,
        type: ''
      }
      const { status, data, error } = await store.dispatch(
        moreDetailsApi.endpoints.pieChartData.initiate(payload)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
