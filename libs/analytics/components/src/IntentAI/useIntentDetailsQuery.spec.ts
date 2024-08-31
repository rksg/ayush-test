import { intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }   from '@acx-ui/test-utils'

import { mockedIntentCRRM } from './AIDrivenRRM/__tests__/fixtures'
import { kpis }             from './AIDrivenRRM/common'
import { api }              from './useIntentDetailsQuery'

describe('intentAI services', () => {
  describe('intent details', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentDetails', {
        data: { intent: mockedIntentCRRM }
      })

      const { status, data, error } = await store.dispatch(
        api.endpoints.intentDetails.initiate({
          root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
          sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
          code: mockedIntentCRRM.code,
          kpis
        })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      expect(data).toStrictEqual({
        code: 'c-crrm-channel24g-auto',
        id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
        metadata: {
          dataEndTime: '2023-06-26T00:00:25.772Z'
        },
        path: [
          { name: 'vsz34', type: 'system' },
          { name: '21_US_Beta_Samsung', type: 'domain' },
          { name: '21_US_Beta_Samsung', type: 'zone' }
        ],
        updatedAt: '2023-06-26T06:04:00.000Z',
        sliceType: 'zone',
        sliceValue: '21_US_Beta_Samsung',
        displayStatus: 'applyscheduled',
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2023-06-26T00:00:25.772Z',
            result: 2
          }
        },
        statusTrail: mockedIntentCRRM.statusTrail,
        preferences: undefined
      })
    })
  })
})
