import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { incidentSummaryFixture, trafficSummaryFixture } from './__tests__/fixtures'
import { api, RequestPayload }                           from './services'

describe('Summary tile apis', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  const payload: RequestPayload = {
    filter: {},
    start: '2021-12-31T00:00:00+00:00',
    end: '2022-01-01T00:00:00+00:00'
  }
  describe('traffic summary', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'TrafficSummary', { data: trafficSummaryFixture })
      const { status, data, error } = await store.dispatch(
        api.endpoints.traffic.initiate(payload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(trafficSummaryFixture)
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'TrafficSummary', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.traffic.initiate(payload)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
  describe('incident summary', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'IncidentSummary', { data: incidentSummaryFixture })
      const { status, data, error } = await store.dispatch(
        api.endpoints.incidents.initiate(payload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(incidentSummaryFixture)
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'IncidentSummary', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.incidents.initiate(payload)
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
