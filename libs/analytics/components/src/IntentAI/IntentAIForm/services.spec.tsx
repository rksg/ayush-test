import { omit } from 'lodash'

import { recommendationUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }         from '@acx-ui/test-utils'

import { kpis }             from '../AIDrivenRRM'
import { mockedIntentCRRM } from '../AIDrivenRRM/IntentAIDetails/__tests__/fixtures'

import { api, kpiHelper } from './services'

describe('intentAI services', () => {
  describe('intent details', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
        data: { intent: mockedIntentCRRM }
      })

      const { status, data, error } = await store.dispatch(
        api.endpoints.intentDetails.initiate({ id: mockedIntentCRRM.id, kpis })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      const removedMsgs = omit(data, [
        'category',
        'priority',
        'summary'
      ])
      expect(removedMsgs).toStrictEqual({
        appliedOnce: true,
        dataEndTime: '2023-06-26T00:00:25.772Z',
        code: 'c-crrm-channel24g-auto',
        id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
        metadata: {},
        path: [
          { name: 'vsz34', type: 'system' },
          { name: '21_US_Beta_Samsung', type: 'domain' },
          { name: '21_US_Beta_Samsung', type: 'zone' }
        ],
        updatedAt: '2023-06-26T06:04:00.000Z',
        sliceType: 'zone',
        sliceValue: '21_US_Beta_Samsung',
        status: 'applyscheduled',
        kpi_number_of_interfering_links: {
          current: 2,
          previous: null,
          projected: 0
        },
        statusTrail: mockedIntentCRRM.statusTrail,
        preferences: undefined
      })
    })
  })
})

describe('kpiHelper', () => {
  it('should return correct kpi', () => {
    const kpi = kpiHelper(kpis)
    const result = kpi.includes('kpi_number_of_interfering_links')
    expect(result).toEqual(true)
  })
})
