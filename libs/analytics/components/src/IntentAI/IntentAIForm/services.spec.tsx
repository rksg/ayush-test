import { omit, pick } from 'lodash'
import moment         from 'moment-timezone'

import { intentAIUrl, Provider, recommendationUrl, store }                 from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import {
  mockedIntentCRRM
} from '../IntentAIDetails/__tests__/fixtures'


import { kpis }                                                                                                                  from './AIDrivenRRM'
import {  EnhancedIntent, IntentDetails, kpiHelper, recApi, roundUpTimeToNearest15Minutes, useUpdatePreferenceScheduleMutation } from './services'

const commonArgs = {
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
  updatedAt: '06/26/2023 06:04',
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

} as unknown as IntentDetails

describe('intentAI services', () => {
  describe('intent code', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'IntentCode', {
        data: { intent: pick(mockedIntentCRRM, ['id', 'code', 'status']) }
      })
      const { status, data, error } = await store.dispatch(
        recApi.endpoints.intentCode.initiate({ id: mockedIntentCRRM.id })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      expect(data).toEqual(pick(mockedIntentCRRM, ['id', 'code', 'status']))
    })
  })

  describe('intent details', () => {
    const expectedResult = {
      ...commonArgs,
      appliedOnce: true,
      settings: {
        date: null,
        hour: null
      }
    } as unknown as EnhancedIntent
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
        data: { intent: mockedIntentCRRM }
      })

      const { status, data, error } = await store.dispatch(
        recApi.endpoints.intentDetails.initiate({ id: mockedIntentCRRM.id, kpis })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      const removedMsgs = omit(data, [
        'category',
        'priority',
        'summary'
      ])
      expect(removedMsgs).toStrictEqual<EnhancedIntent>(expectedResult)
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

describe('roundUpTimeToNearest15Minutes', () => {
  it('should return correct decimal hour', () => {
    const timeString = '08:30:00'
    expect(roundUpTimeToNearest15Minutes(timeString)).toEqual(8.5)
  })
})

describe('intentai services', () => {
  const args = {
    ...commonArgs,
    appliedOnce: true,
    settings: {
      date: moment('2024-07-13'),
      hour: 1.75
    }
  }

  it('should update preference and schedule correctly',
    async () => {
      const utils = require('./utils')
      jest.spyOn(utils, 'handleScheduledAt').mockImplementation(() => '2024-07-14T07:30:00.000Z')
      const resp = { transition: { success: true, errorMsg: '' , errorCode: '' } }
      mockGraphqlMutation(intentAIUrl, 'TransitionMutation', { data: resp })
      const { result } = renderHook(
        () => useUpdatePreferenceScheduleMutation(),
        { wrapper: Provider }
      )
      act(() => {
        result.current[0](args as EnhancedIntent)
      })
      await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
      expect(result.current[1].data)
        .toEqual(resp)
    })
})

