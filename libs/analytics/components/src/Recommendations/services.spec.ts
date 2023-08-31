/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { recommendationUrl, store, Provider }                              from '@acx-ui/store'
import { mockGraphqlQuery, mockGraphqlMutation, act, renderHook, waitFor } from '@acx-ui/test-utils'
import {
  DateRange,
  setUpIntl,
  NetworkPath
} from '@acx-ui/utils'

import { crrmListResult, recommendationListResult } from './__tests__/fixtures'
import {
  api,
  useCancelRecommendationMutation,
  useMuteRecommendationMutation,
  useScheduleRecommendationMutation
} from './services'

describe('Recommendation services', () => {
  const props = {
    startDate: '2023-06-10T00:00:00+08:00',
    endDate: '2023-06-17T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath,
    filter: {}
  } as const

  beforeEach(() => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
    store.dispatch(api.util.resetApiState())
  })

  it('should return crrm list', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', {
      data: crrmListResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.crrmList.initiate({ ...props, n: 5 })
    )

    const expectedResult = [
      { ...crrmListResult.recommendations[0], appliedOnce: true },
      { ...crrmListResult.recommendations[1], appliedOnce: true },
      { ...crrmListResult.recommendations[2], appliedOnce: false }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

  it('should return recommendation list', async () => {
    mockGraphqlQuery(recommendationUrl, 'RecommendationList', {
      data: recommendationListResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.recommendationList.initiate(props)
    )

    const expectedResult = [
      {
        ...recommendationListResult.recommendations[0],
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        priority: 2,
        priorityLabel: 'High',
        category: 'AI-Driven Cloud RRM',
        summary: 'More optimal channel plan and channel bandwidth selection on 5 GHz radio',
        status: 'Applied',
        statusTooltip: 'Recommendation has been successfully applied on 06/16/2023 06:05.',
        statusEnum: 'applied'
      },
      {
        ...recommendationListResult.recommendations[1],
        scope: `vsz6 (SZ Cluster)
> EDU (Venue)`,
        type: 'Venue',
        priority: 1,
        priorityLabel: 'Medium',
        category: 'Wi-Fi Client Experience',
        summary: 'Tx power setting for 2.4 GHz and 5 GHz radio',
        status: 'Revert Failed',
        statusTooltip: 'Error(s) were encountered on 06/16/2023 06:06 when the reversion was applied. Errors: AP (MAC) on 5 GHz: unknown error',
        statusEnum: 'revertfailed'
      },
      {
        ...recommendationListResult.recommendations[2],
        scope: `vsz34 (SZ Cluster)
> 27-US-CA-D27-Peat-home (Domain)
> Deeps Place (Venue)`,
        type: 'Venue',
        priority: 0,
        priorityLabel: 'Low',
        category: 'Wi-Fi Client Experience',
        summary: 'Enable band balancing',
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
      result.current[0]({ id: 'test', scheduledAt: '7-15-2023' })
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
})
