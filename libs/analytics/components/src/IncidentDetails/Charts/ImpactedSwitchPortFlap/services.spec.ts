import { fakeIncident1 }     from '@acx-ui/analytics/utils'
import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { mockImpactedSwitches } from './__tests__/fixtures'
import { api }                  from './services'


describe('incidentDetailsApi', () => {
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  describe('impactedSwitches', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      const { status, data, error } = await store.dispatch(
        api.endpoints.portFlapImpactedSwitch.initiate({ id: fakeIncident1.id, n: 100, search: '' })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual({
        name: 'ICX8200-24P Router',
        mac: '38:45:3B:3C:F1:20',
        model: 'ICX8200',
        firmware: 'RDR10020_b237',
        ports: [{
          portNumber: '1/2/3',
          connectedDevice: {
            name: 'Device 1'
          }
        },
        {
          portNumber: '2/1/20',
          connectedDevice: {
            name: 'Device 2'
          }
        }]
      })
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.portFlapImpactedSwitch.initiate({ id: 'xxx', n: 100, search: '' })
      )
      expect(status).toBe('rejected')
      expect(data).toBe(undefined)
      expect(error).not.toBe(undefined)
    })
  })
})
