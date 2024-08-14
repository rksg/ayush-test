import { omit, pick } from 'lodash'
import moment         from 'moment-timezone'

import { intentAIUrl, Provider, recommendationUrl, store }                 from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import {
  mockedIntentCRRM
} from '../IntentAIDetails/__tests__/fixtures'
import { IntentAIFormDto, IntentAIFormSpec } from '../types'


import { kpis }                                                                                                              from './AIDrivenRRM'
import {  EnhancedIntent, kpiHelper, recApi, roundUpTimeToNearest15Minutes, specToDto, useUpdatePreferenceScheduleMutation } from './services'

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
      expect(removedMsgs).toStrictEqual<EnhancedIntent>({
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
      } as unknown as EnhancedIntent)
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

describe('specToDto', () => {
  const scheduledAt = '2024-07-13T07:30:00.000Z'
  const commonSpec = {
    id: 'test',
    status: 'new',
    sliceValue: 'test',
    updatedAt: 'test',
    preferences: { crrmFullOptimization: false }
  } as IntentAIFormSpec
  it('should process spec with scheduledAt',
    async () => {
      const spec ={
        ...commonSpec,
        metadata: {
          scheduledAt: scheduledAt
        }
      }
      const dto = {
        id: 'test',
        status: 'new',
        sliceValue: 'test',
        updatedAt: 'test',
        preferences: { crrmFullOptimization: false },
        settings: {
          date: moment.utc(scheduledAt).local(),
          hour: 7.5
        }
      } as IntentAIFormDto
      expect(specToDto(spec)).toEqual(dto)
    })
  it('should process spec without scheduledAt',
    async () => {
      const spec ={
        ...commonSpec,
        metadata: {
        }
      }
      const dto = {
        id: 'test',
        status: 'new',
        sliceValue: 'test',
        updatedAt: 'test',
        preferences: { crrmFullOptimization: false },
        settings: {
          date: null,
          hour: null
        }
      } as IntentAIFormDto
      expect(specToDto(spec)).toEqual(dto)

    })

})

describe('intentai services', () => {
  const commonArgs = {
    id: 'test',
    status: 'new',
    sliceValue: 'test',
    updatedAt: '',
    preferences: { crrmFullOptimization: false }
  }


  it('should update preference and schedule correctly if scheduledAt < currentTime + 15',
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
        result.current[0]({
          ...commonArgs,
          settings: {
            date: moment('2024-07-13'),
            hour: 7.5
          }
        } as IntentAIFormDto)
      })
      await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
      expect(result.current[1].data)
        .toEqual(resp)
    })
})