import { omit, pick }          from 'lodash'
import moment, { MomentInput } from 'moment-timezone'

import { intentAIUrl, Provider, recommendationUrl, store }                 from '@acx-ui/store'
import { act, mockGraphqlMutation, mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { IntentAIFormDto } from '../types'

import {
  mockedRecommendationCRRM,
  mockedRecommendationCRRMApplied
} from './__tests__/fixtures'
import { recApi, EnhancedRecommendation, kpiHelper, useUpdatePreferenceScheduleMutation, roundUpTimeToNearest15Minutes } from './services'


describe('recommendation services', () => {
  const recommendationPayload = {
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
    status: 'new'
  }

  describe('crrm recommendation code', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'IntentCode', {
        data: { recommendation: pick(mockedRecommendationCRRM, ['id', 'code']) }
      })
      const { status, data, error } = await store.dispatch(
        recApi.endpoints.intentCode.initiate({
          ...recommendationPayload })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      expect(data).toEqual({
        code: 'c-crrm-channel24g-auto',
        id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
      })
    })
  })

  describe('crrm recommendation details', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
        data: {
          recommendation: mockedRecommendationCRRM
        }
      })

      const { status, data, error } = await store.dispatch(
        recApi.endpoints.intentDetails.initiate({
          ...recommendationPayload, isCrrmPartialEnabled: true })
      )
      expect(status).toBe('fulfilled')
      expect(error).toBeUndefined()
      const removedMsgs = omit(data, [
        'category',
        'priority',
        'summary',
        'tooltipContent'
      ])
      expect(removedMsgs).toStrictEqual<EnhancedRecommendation>({
        appliedOnce: true,
        firstAppliedAt: '2023-05-23T00:00:35.308Z',
        appliedTime: '2023-06-25T00:00:25.772Z',
        dataEndTime: '2023-06-26T00:00:25.772Z',
        code: 'c-crrm-channel24g-auto',
        currentValue: 'crrm',
        id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6',
        metadata: {},
        monitoring: null,
        originalValue: [
          { channelMode: 'CHANNEL_FLY', channelWidth: '_80MHZ', radio: '2.4' }
        ],
        path: [
          { name: 'vsz34', type: 'system' },
          { name: '21_US_Beta_Samsung', type: 'domain' },
          { name: '21_US_Beta_Samsung', type: 'zone' }
        ],
        updatedAt: '06/26/2023 06:04',
        recommendedValue: 'crrm',
        sliceType: 'zone',
        sliceValue: '21_US_Beta_Samsung',
        status: 'applyscheduled',
        kpi_number_of_interfering_links: {
          current: 2,
          previous: null,
          projected: 0
        },
        statusTrail: mockedRecommendationCRRM.statusTrail,
        trigger: 'daily'
      } as unknown as EnhancedRecommendation)
    })
  })

  it('should return recommendation details with monitoring data for CRRM', async () => {
    const appliedTime = mockedRecommendationCRRMApplied.appliedTime
    const spy =jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(appliedTime).getTime()
    })
    mockGraphqlQuery(recommendationUrl, 'IntentDetails', {
      data: {
        recommendation: mockedRecommendationCRRMApplied
      }
    })
    const { status, data, error } = await store.dispatch(
      recApi.endpoints.intentDetails.initiate({
        ...recommendationPayload, isCrrmPartialEnabled: true
      })
    )
    expect(status).toBe('fulfilled')
    expect(error).toBeUndefined()
    expect(data).toEqual<EnhancedRecommendation>(
      expect.objectContaining({
        code: 'c-crrm-channel5g-auto',
        monitoring: {
          until: '2023-06-26T00:00:25.772Z'
        }
      })
    )
    spy.mockRestore()
  })
})

describe('kpiHelper', () => {
  it('should return correct kpi', () => {
    const code = 'c-crrm-channel24g-auto'
    const kpi = kpiHelper(code)
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

// describe('specToDto', () => {
//   const scheduledAt = '2024-07-13T07:30:00.000Z'
//   const spec = {
//     id: 'test',
//     status: 'new',
//     sliceValue: 'test',
//     updatedAt: 'test',
//     metadata: {
//       scheduledAt: scheduledAt,
//       preferences: { crrmFullOptimization: false }
//     }
//   } as unknown as EnhancedRecommendation

//   it('should process spec with',
//     async () => {
//   const dto = {
//     id: 'test',
//     status: 'new',
//     sliceValue: 'test',
//     updatedAt: '',
//     preferences: { crrmFullOptimization: false },
//     settings: {
//       date: moment(scheduledAt),
//       hour: 7.5
//     }
//   } as IntentAIFormDto
//   expect(specToDto(spec)).toEqual()

// })

describe('intentai services', () => {
  // jest.mock('moment-timezone', () => {
  //   const moment = jest.requireActual<typeof import('moment-timezone')>('moment-timezone')
  //   return {
  //     __esModule: true,
  //     ...moment,
  //     default: (date: MomentInput) => date === '2024-07-13T07:30:00.000Z'
  //       ? moment(date)
  //       : moment('2024-07-13T07:35:00') // mock current date
  //   }
  // })
  const commonArgs = {
    id: 'test',
    status: 'new',
    sliceValue: 'test',
    updatedAt: '',
    preferences: { crrmFullOptimization: false }
  }
  beforeEach(() => {
    jest.mock('moment-timezone', () => {
      const actualMoment = jest.requireActual('moment-timezone')
      return {
        __esModule: true,
        ...actualMoment,
        default: (date: MomentInput) =>
          date === '2024-07-13T07:30:00.000Z'
            ? actualMoment(date)
            : actualMoment('2024-07-13T07:35:00') // mock current date
      }
    })
    jest.resetModules()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should update preference and schedule correctly if scheduledAt < currentTime + 15',
    async () => {
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

  it('should update preference and schedule correctly if scheduledAt >= currentTime + 15',
    async () => {
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
            date: moment('2024-09-13'),
            hour: 8.5
          }
        } as IntentAIFormDto)
      })
      await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
      expect(result.current[1].data)
        .toEqual(resp)
    })

  // it('should update preference and schedule correctly if no initial scheduledAt',
  //   async () => {
  //     const resp = { transition: { success: true, errorMsg: '' , errorCode: '' } }
  //     mockGraphqlMutation(intentAIUrl, 'TransitionMutation', { data: resp })

  //     const { result } = renderHook(
  //       () => useUpdatePreferenceScheduleMutation(),
  //       { wrapper: Provider }
  //     )
  //     act(() => {
  //       result.current[0]({
  //         ...commonArgs,
  //         settings: {
  //           date: null,
  //           hour: null
  //         }
  //       } as IntentAIFormDto)
  //     })
  //     await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
  //     expect(result.current[1].data)
  //       .toEqual(resp)
  //   })
})