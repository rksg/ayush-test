import moment from 'moment-timezone'

import { fakeIncident1 }     from '@acx-ui/analytics/utils'
import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockImpactedSwitches, mockMemoryUtilization } from './__tests__/fixtures'
import { api }                                         from './services'


describe('incidentDetailsApi', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  describe('impactedSwitches', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      const { status, data, error } = await store.dispatch(
        api.endpoints.impactedSwitches.initiate({ id: fakeIncident1.id, n: 100, search: '' })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual({
        name: 'ICX8200-24P Router',
        mac: '38:45:3B:3C:F1:20',
        model: 'ICX8200-24P',
        firmware: 'RDR10020_b237'
      })
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.impactedSwitches.initiate({ id: 'xxx', n: 100, search: '' })
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
  describe('memoryUtilization', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'MemoryUtilization', mockMemoryUtilization)
      const { status, data, error } = await store.dispatch(
        api.endpoints.memoryUtilization.initiate({
          start: moment('2022-07-20T02:42:00.000Z').subtract(10, 'second').toISOString(),
          end: moment('2022-07-20T02:42:00.000Z').toISOString(),
          path: fakeIncident1.path
        })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual({
        memoryTime: '2024-02-01T07:00:00.000Z',
        memoryValue: 0.75
      })
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'MemoryUtilization', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.memoryUtilization.initiate({
          start: moment('2022-07-21T02:42:00.000Z').subtract(10, 'second').toISOString(),
          end: moment('2022-07-21T02:42:00.000Z').toISOString(),
          path: fakeIncident1.path
        })
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
