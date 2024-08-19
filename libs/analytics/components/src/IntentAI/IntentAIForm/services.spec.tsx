import { omit, pick } from 'lodash'
import moment         from 'moment-timezone'

import { intentAIUrl, Provider, recommendationUrl, store }                 from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import {
  mockedIntentCRRM
} from '../IntentAIDetails/__tests__/fixtures'


import { kpis }                                                                                                   from './AIDrivenRRM'
import {  EnhancedIntent, kpiHelper, recApi, roundUpTimeToNearest15Minutes, useUpdatePreferenceScheduleMutation } from './services'

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
      ...mockedIntentCRRM,
      appliedOnce: true,
      settings: {
        date: moment.parseZone('2023-07-15T14:15:00.000Z').local(),
        hour: 14.25
      },
      preferences: undefined
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
    ...mockedIntentCRRM,
    appliedOnce: true,
    settings: {
      date: moment('2024-07-14'),
      hour: 7.5
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

