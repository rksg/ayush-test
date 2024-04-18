import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import {
  summaryDataFixture,
  summaryWirelessDataFixture,
  switchCountFixture }  from './__tests__/fixtures'
import { api, RequestPayload } from './services'

describe('Summary tile apis', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  const payload: RequestPayload = {
    filter: {},
    start: '2021-12-31T00:00:00+00:00',
    end: '2022-01-01T00:00:00+00:00'
  }
  describe('summary data api', () => {
    it('should return correct data for wireless and wired', async () => {
      mockGraphqlQuery(dataApiURL, 'SummaryQuery', { data: summaryDataFixture })
      const { status, data, error } = await store.dispatch(
        api.endpoints.summaryData.initiate(payload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(summaryDataFixture.network.hierarchyNode)
      expect(error).toBe(undefined)
    })
    it('should return correct data for wireless only', async () => {
      mockGraphqlQuery(dataApiURL, 'SummaryQuery', { data: summaryWirelessDataFixture })
      const { status, data, error } = await store.dispatch(
        api.endpoints.summaryData.initiate({ ...payload, wirelessOnly: true })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(summaryWirelessDataFixture.network.hierarchyNode)
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'SummaryQuery', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.summaryData.initiate(payload)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
  describe('switch count api', () => {
    it('should return correct', async () => {
      mockGraphqlQuery(dataApiURL, 'SwitchCount', { data: switchCountFixture })
      const { status, data, error } = await store.dispatch(
        api.endpoints.switchCount.initiate(payload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(switchCountFixture.network.hierarchyNode)
      expect(error).toBe(undefined)
    })

    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'SwitchCount', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.switchCount.initiate(payload)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
