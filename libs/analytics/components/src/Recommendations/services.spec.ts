/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { defaultNetworkPath }                                              from '@acx-ui/analytics/utils'
import { recommendationUrl, store, Provider }                              from '@acx-ui/store'
import { mockGraphqlQuery, mockGraphqlMutation, act, renderHook, waitFor } from '@acx-ui/test-utils'
import { PathFilter, DateRange, NetworkPath }                              from '@acx-ui/utils'

import {
  crrmListResult,
  aiOpsListResult,
  recommendationListResult
} from './__tests__/fixtures'
import { crrmStates, priorities }   from './config'
import { mockedRecommendationCRRM } from './RecommendationDetails/__tests__/fixtures'
import {
  api,
  getCrrmOptimizedState,
  getCrrmInterferingLinksText,
  useCancelRecommendationMutation,
  useMuteRecommendationMutation,
  useScheduleRecommendationMutation,
  useSetPreferenceMutation,
  useDeleteRecommendationMutation
} from './services'

describe('Recommendations utils', () => {
  describe('getCrrmOptimizedState', () => {
    it('returns optimized state', () => {
      expect(getCrrmOptimizedState('applyscheduled')).toEqual(crrmStates.optimized)
    })

    it('returns non optimized state', () => {
      expect(getCrrmOptimizedState('new')).toEqual(crrmStates.nonOptimized)
    })
  })

  describe('getCrrmInterferingLinksText', () => {
    beforeEach(() =>
      jest.spyOn(require('./utils'), 'isDataRetained')
        .mockImplementation(() => true)
    )
    it('returns text when applied', () => {
      expect(getCrrmInterferingLinksText('applied', '', {
        current: 0,
        previous: 3,
        projected: null
      })).toBe('From 3 to 0 interfering links')
    })

    it('returns text when revertfailed', () => {
      expect(getCrrmInterferingLinksText('revertfailed', '', {
        current: 0,
        previous: 3,
        projected: null
      })).toBe('Revert Failed')
    })

    it('returns text when reverted', () => {
      expect(getCrrmInterferingLinksText('reverted', '', {
        current: 5,
        previous: 5,
        projected: null
      })).toBe('Reverted')
    })

    it('returns text when new', () => {
      expect(getCrrmInterferingLinksText('new', '', {
        current: 2,
        previous: null,
        projected: 0
      })).toBe('2 interfering links can be optimized to 0')
    })

    it('returns text when reverted but no previous (revertedTime < appliedTime+24hours)', () => {
      expect(getCrrmInterferingLinksText('reverted', '', {
        current: 2,
        previous: null,
        projected: 0
      })).toBe('Reverted')
    })

    it('returns text when applied but no previous (maxIngestedTime < appliedTime+24hours)', () => {
      expect(getCrrmInterferingLinksText('applied', '', {
        current: 2,
        previous: null,
        projected: 0
      })).toBe('From 2 to 0 interfering links')
    })

    it('returns text when applyscheduled', () => {
      expect(getCrrmInterferingLinksText('applyscheduled', '', {
        current: 2,
        previous: null,
        projected: 0
      })).toBe('From 2 to 0 interfering links')
    })

    it('returns text when applyfailed', () => {
      expect(getCrrmInterferingLinksText('applyfailed', '', {
        current: 2,
        previous: null,
        projected: 0
      })).toBe('Failed')
    })

    it('returns text when data retention period passed', () => {
      jest.spyOn(require('./utils'), 'isDataRetained')
        .mockImplementation(() => false)
      expect(getCrrmInterferingLinksText('reverted', '', {
        current: 2,
        previous: null,
        projected: 0
      })).toBe('Beyond data retention period')
    })
  })
})

describe('Recommendation services', () => {
  const props = {
    startDate: '2023-06-10T00:00:00+08:00',
    endDate: '2023-06-17T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: defaultNetworkPath
  } as PathFilter

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    jest.spyOn(require('./utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })

  it('should return crrm list', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmListResult })

    const { status, data, error } = await store.dispatch(
      api.endpoints.crrmList.initiate({ ...props, n: 5 })
    )

    const expectedResult = [
      {
        ...crrmListResult.recommendations[0],
        crrmOptimizedState: crrmStates.optimized,
        summary: 'Optimal Ch/Width and Tx Power found for 5 GHz radio'
      },
      {
        ...crrmListResult.recommendations[1],
        crrmOptimizedState: crrmStates.nonOptimized,
        summary: 'Optimal Ch/Width and Tx Power found for 2.4 GHz radio'
      },
      {
        ...crrmListResult.recommendations[2],
        crrmOptimizedState: crrmStates.nonOptimized,
        summary: 'Optimal Ch/Width and Tx Power found for 6 GHz radio'
      }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({
      crrmCount: 3,
      zoneCount: 3,
      optimizedZoneCount: 1,
      crrmScenarios: 13888,
      recommendations: expectedResult
    })
  })

  it('should return aiOps list', async () => {
    mockGraphqlQuery(recommendationUrl, 'AiOpsList', { data: aiOpsListResult })

    const { status, data, error } = await store.dispatch(
      api.endpoints.aiOpsList.initiate({ ...props, n: 5 })
    )

    const expectedResult = [
      {
        ...aiOpsListResult.recommendations[0],
        priority: priorities.medium,
        category: 'Wi-Fi Client Experience',
        summary: 'Tx Power setting for 2.4 GHz and 5 GHz/6 GHz radio'
      },
      {
        ...aiOpsListResult.recommendations[1],
        priority: priorities.low,
        category: 'Wi-Fi Client Experience',
        summary: 'Enable band balancing'
      }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual({
      aiOpsCount: 2,
      recommendations: expectedResult
    })
  })

  it('returns wlans', async () => {
    const WLANs = [
      { name: 'wlan1', ssid: 'wlan1' },
      { name: 'wlan2', ssid: 'wlan2' },
      { name: 'wlan3', ssid: 'wlan3' }
    ]
    mockGraphqlQuery(recommendationUrl, 'Wlans', { data: { recommendation: { WLANs } } })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recommendationWlans.initiate({ id: 'id1' })
    )
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(WLANs)
  })

  it('should return recommendation list', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: recommendationListResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.recommendationList.initiate({ ...props, isCrrmPartialEnabled: true })
    )

    const expectedResult = [
      {
        ...recommendationListResult.recommendations[0],
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.high,
          text: 'High'
        },
        category: 'AI-Driven Cloud RRM',
        summary: 'Optimal Ch/Width and Tx Power found for 5 GHz radio',
        status: 'Applied',
        statusTooltip: 'Recommendation has been successfully applied on 06/16/2023 06:05.',
        statusEnum: 'applied',
        crrmOptimizedState: {
          ...crrmStates.optimized,
          text: 'Optimized'
        },
        toggles: { crrmFullOptimization: false }
      },
      {
        ...recommendationListResult.recommendations[1],
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.high,
          text: 'High'
        },
        category: 'AI-Driven Cloud RRM',
        summary: 'Optimal Ch/Width and Tx Power found for 5 GHz radio',
        status: 'Revert Scheduled',
        statusTooltip: 'A reversion to undo the configuration change has been scheduled for 06/17/2023 00:00. Note that the actual reversion of configuration will happen asynchronously within 1 hour of the scheduled time.',
        statusEnum: 'revertscheduled',
        crrmOptimizedState: {
          ...crrmStates.nonOptimized,
          text: 'Non-Optimized'
        },
        toggles: { crrmFullOptimization: false }
      },
      {
        ...recommendationListResult.recommendations[2],
        scope: `vsz6 (SZ Cluster)
> EDU (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.medium,
          text: 'Medium'
        },
        category: 'Wi-Fi Client Experience',
        summary: 'Tx Power setting for 2.4 GHz and 5 GHz/6 GHz radio',
        status: 'Revert Failed',
        statusTooltip: 'Error(s) were encountered on 06/16/2023 06:06 when the reversion was applied. Errors: AP (MAC) on 5 GHz: unknown error',
        statusEnum: 'revertfailed'
      },
      {
        ...recommendationListResult.recommendations[3],
        scope: `vsz34 (SZ Cluster)
> 27-US-CA-D27-Peat-home (Domain)
> Deeps Place (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.low,
          text: 'Low'
        },
        category: 'Wi-Fi Client Experience',
        summary: 'Enable band balancing',
        status: 'New',
        statusTooltip: 'Schedule a day and time to apply this recommendation.',
        statusEnum: 'new'
      },
      {
        ...recommendationListResult.recommendations[4],
        id: '1', // _.uniqueId()
        scope: `vsz34 (SZ Cluster)
> 01-US-CA-D1-Test-Home (Domain)
> 01-Alethea-WiCheck Test (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.low,
          text: 'Low'
        },
        category: 'Insufficient Licenses',
        summary: 'No RRM recommendation due to incomplete license compliance',
        status: 'Insufficient Licenses',
        statusTooltip: 'Insufficient Licenses',
        statusEnum: 'insufficientLicenses',
        crrmOptimizedState: {
          ...crrmStates.insufficientLicenses,
          text: 'Insufficient Licenses'
        },
        toggles: { crrmFullOptimization: true }
      },
      {
        ...recommendationListResult.recommendations[5],
        id: '2', // _.uniqueId()
        scope: `vsz34 (SZ Cluster)
> 22-US-CA-D22-Aaron-Home (Domain)
> 22-US-CA-Z22-Aaron-Home (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.low,
          text: 'Low'
        },
        category: 'Verification Error',
        summary: 'No RRM recommendation due to verification error',
        status: 'Verification Error',
        statusTooltip: 'Verification Error',
        statusEnum: 'verificationError',
        crrmOptimizedState: {
          ...crrmStates.verificationError,
          text: 'Verification Error'
        },
        toggles: { crrmFullOptimization: true }
      },
      {
        ...recommendationListResult.recommendations[6],
        id: '3', // _.uniqueId()
        scope: `vsz34 (SZ Cluster)
> 01-US-CA-D1-Test-Home (Domain)
> 01-US-CA-D1-Ruckus-HQ-QA-interop (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.low,
          text: 'Low'
        },
        category: 'Verified',
        summary: 'AI verified and in optimal state',
        status: 'Verified',
        statusTooltip: 'Verified',
        statusEnum: 'verified',
        crrmOptimizedState: {
          ...crrmStates.verified,
          text: 'Verified'
        },
        toggles: { crrmFullOptimization: true }
      },
      {
        ...recommendationListResult.recommendations[7],
        id: '4', // _.uniqueId()
        scope: `vsz34 (SZ Cluster)
> 23-IND-BNG-D23-Keshav-Home (Domain)
> 23-IND-BNG-D23-Keshav-Home (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.low,
          text: 'Low'
        },
        category: 'Unqualified Zone',
        summary: 'No RRM recommendation as venue is unqualified',
        status: 'Unqualified Zone',
        statusTooltip: 'Unqualified Zone',
        statusEnum: 'unqualifiedZone',
        crrmOptimizedState: {
          ...crrmStates.unqualifiedZone,
          text: 'Unqualified Zone'
        },
        toggles: { crrmFullOptimization: true }
      },
      {
        ...recommendationListResult.recommendations[8],
        id: '5', // _.uniqueId()
        scope: `vsz34 (SZ Cluster)
> 25-US-CA-D25-SandeepKour-home (Domain)
> 25-US-CA-D25-SandeepKour-home (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.low,
          text: 'Low'
        },
        category: 'No APs',
        summary: 'No RRM recommendation as venue has no APs',
        status: 'No APs',
        statusTooltip: 'No APs',
        statusEnum: 'noAps',
        crrmOptimizedState: {
          ...crrmStates.noAps,
          text: 'No APs'
        },
        toggles: { crrmFullOptimization: true }
      },
      {
        ...recommendationListResult.recommendations[9],
        id: '6', // _.uniqueId()
        scope: `vsz-h-bdc-home-network-05 (SZ Cluster)
> 22-US-CA-Z22-Aaron-Home (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.low,
          text: 'Low'
        },
        category: 'Unknown',
        summary: 'Unknown',
        status: 'Unknown',
        statusTooltip: 'Unknown',
        statusEnum: 'unknown',
        crrmOptimizedState: {
          ...crrmStates.unknown,
          text: 'Unknown'
        },
        toggles: { crrmFullOptimization: true }
      },
      {
        ...recommendationListResult.recommendations[10],
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.high,
          text: 'High'
        },
        category: 'AI-Driven Cloud RRM',
        summary: 'Optimal channel plan found for 2.4 GHz radio',
        status: 'New',
        statusTooltip: 'Schedule a day and time to apply this recommendation.',
        statusEnum: 'new',
        crrmOptimizedState: {
          ...crrmStates.nonOptimized,
          text: 'Non-Optimized'
        },
        toggles: { crrmFullOptimization: true }
      },
      {
        ...recommendationListResult.recommendations[11],
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.medium,
          text: 'Medium'
        },
        category: 'Wi-Fi Client Experience',
        summary: 'Enable AirFlexAI for 2.4 GHz',
        status: 'New',
        statusTooltip: 'Schedule a day and time to apply this recommendation.',
        statusEnum: 'new'
      },
      {
        ...recommendationListResult.recommendations[12],
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.medium,
          text: 'Medium'
        },
        category: 'Wi-Fi Client Experience',
        summary: 'Enable AirFlexAI for 5 GHz',
        status: 'New',
        statusTooltip: 'Schedule a day and time to apply this recommendation.',
        statusEnum: 'new'
      },
      {
        ...recommendationListResult.recommendations[13],
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        priority: {
          ...priorities.medium,
          text: 'Medium'
        },
        category: 'Wi-Fi Client Experience',
        summary: 'Enable AirFlexAI for 6 GHz',
        status: 'New',
        statusTooltip: 'Schedule a day and time to apply this recommendation.',
        statusEnum: 'new'
      }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

  it('should mute correctly', async () => {
    const resp = { toggleMute: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'MuteRecommendation', { data: resp })

    const { result } = renderHook(
      () => useMuteRecommendationMutation(),
      { wrapper: Provider }
    )
    act(() => {
      result.current[0]({ id: 'test', mute: true })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data)
      .toEqual(resp)
  })

  it('should schedule correctly', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'ScheduleRecommendation', { data: resp })

    const { result } = renderHook(
      () => useScheduleRecommendationMutation(),
      { wrapper: Provider }
    )
    act(() => {
      result.current[0]({ id: 'test', type: 'Apply', scheduledAt: '7-15-2023' })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data)
      .toEqual(resp)
  })

  it('should schedule with wlans', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'ScheduleRecommendation', { data: resp })

    const { result } = renderHook(
      () => useScheduleRecommendationMutation(),
      { wrapper: Provider }
    )
    act(() => {
      result.current[0]({
        id: 'test',
        type: 'Apply',
        scheduledAt: '7-15-2023',
        wlans: [{ ssid: 'test', name: 'test' }]
      })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data)
      .toEqual(resp)
  })

  it('should cancel correctly', async () => {
    const resp = { cancel: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'CancelRecommendation', { data: resp })

    const { result } = renderHook(
      () => useCancelRecommendationMutation(),
      { wrapper: Provider }
    )
    act(() => {
      result.current[0]({ id: 'test' })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data)
      .toEqual(resp)
  })

  it('should delete correctly', async () => {
    const resp = { deleteRecommendation: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'DeleteRecommendation', { data: resp })
    const { result } = renderHook(
      () => useDeleteRecommendationMutation(),{ wrapper: Provider })
    act(() => { result.current[0]({ id: 'test' }) })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data).toEqual(resp)
  })

  it('should return crrmKpi', async () => {
    const spy = jest.spyOn(require('./utils'), 'isDataRetained')
      .mockImplementation(() => true)
    const recommendationPayload = {
      id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
    }
    mockGraphqlQuery(recommendationUrl, 'CrrmKpi', {
      data: {
        recommendation: mockedRecommendationCRRM
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.crrmKpi.initiate({
        ...recommendationPayload,
        code: 'c-crrm-channel24g-auto',
        status: 'new'
      })
    )
    expect(status).toBe('fulfilled')
    expect(error).toBeUndefined()
    expect(data).toEqual({ text: 'From 2 to 0 interfering links' })
    expect(spy).toBeCalledWith(mockedRecommendationCRRM.dataEndTime)
  })

  it('should setPreferences correctly', async () => {
    const resp = { schedule: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'SetPreference', { data: resp })

    const idPath = [
      { type: 'system', name: 'e6b60f6a-d5eb-4e46-b9d9-10ce752181c8' },
      { type: 'domain', name: '27-US-CA-D27-Peat-home' },
      { type: 'zone', name: '27-US-CA-Z27-Peat-home' }
    ] as NetworkPath
    const { result } = renderHook(
      () => useSetPreferenceMutation(),
      { wrapper: Provider }
    )
    act(() => {
      result.current[0]({ path: idPath, preferences: { crrmFullOptimization: false } })
    })
    await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    expect(result.current[1].data)
      .toEqual(resp)
  })
})
