import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockTimeseriesResponseData } from './__tests__/fixtures'
import { api, TimeseriesPayload }     from './services'

const mockPayload: TimeseriesPayload = {
  start: '2024-03-23T07:23:00+05:30',
  end: '2025-05-24T07:23:00+05:30'
}

describe('ClientExperience services', () => {
  describe('clientExperienceTimeseries', () => {
    it('should return client experience timeseries data correctly', async () => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', {
        data: { franchisorTimeseries: mockTimeseriesResponseData }
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.clientExperienceTimeseries.initiate(mockPayload)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockTimeseriesResponseData)
      expect(error).toBe(undefined)
    })

    it('should handle error', async () => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.clientExperienceTimeseries.initiate({} as TimeseriesPayload)
      )
      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).not.toBeUndefined()
    })
  })
})