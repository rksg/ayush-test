/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { defineMessage } from 'react-intl'

import { recommendationUrl, store, Provider }                              from '@acx-ui/store'
import { mockGraphqlQuery, mockGraphqlMutation, act, renderHook, waitFor } from '@acx-ui/test-utils'
import { DateRange, NetworkPath }                                          from '@acx-ui/utils'

import { crrmListResult, recommendationListResult } from './__tests__/fixtures'
import { crrmStates }                               from './config'
import {
  api,
  transformCrrmList,
  getCrrmOptimizedState,
  getCrrmInterferingLinksText,
  useCancelRecommendationMutation,
  useMuteRecommendationMutation,
  useScheduleRecommendationMutation
} from './services'

import type { CrrmListItem } from './services'

describe('Recommendations utils', () => {
  let recommendations: CrrmListItem[]
  beforeAll(() => {
    recommendations = transformCrrmList(crrmListResult.recommendations as unknown as CrrmListItem[])
  })

  describe('getCrrmOptimizedState', () => {
    it('returns optimized state', () => {
      expect(getCrrmOptimizedState(recommendations[0].status)).toEqual(crrmStates.optimized)
    })

    it('returns non optimized state', () => {
      expect(getCrrmOptimizedState(recommendations[1].status)).toEqual(crrmStates.nonOptimized)
    })
  })

  describe('getCrrmInterferingLinksText', () => {
    it('returns text when applied', () => {
      const { status, kpi_number_of_interfering_links } = recommendations[0]
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('From 3 to 0 interfering links')
    })

    it('returns text when revertfailed', () => {
      const recommendation = { ...recommendations[0], status: 'revertfailed' } as CrrmListItem
      const { status, kpi_number_of_interfering_links } = recommendation
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('Revert Failed')
    })

    it('returns text when reverted', () => {
      const { status, kpi_number_of_interfering_links } = recommendations[1]
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('Reverted')
    })

    it('returns text when new', () => {
      const { status, kpi_number_of_interfering_links } = recommendations[2]
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('2 interfering links can be optimized to 0')
    })

    it('returns text when reverted but no previous (revertedTime < appliedTime+24hours)', () => {
      const recommendation = { ...recommendations[2], status: 'reverted' } as CrrmListItem
      const { status, kpi_number_of_interfering_links } = recommendation
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('Reverted')
    })

    it('returns text when applied but no previous (maxIngestedTime < appliedTime+24hours)', () => {
      const recommendation = { ...recommendations[2], status: 'applied' } as CrrmListItem
      const { status, kpi_number_of_interfering_links } = recommendation
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('2 interfering links will be optimized to 0')
    })

    it('returns text when applyscheduled', () => {
      const recommendation = { ...recommendations[2], status: 'applyscheduled' } as CrrmListItem
      const { status, kpi_number_of_interfering_links } = recommendation
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('2 interfering links will be optimized to 0')
    })

    it('returns text when applyfailed', () => {
      const recommendation = { ...recommendations[2], status: 'applyfailed' } as CrrmListItem
      const { status, kpi_number_of_interfering_links } = recommendation
      expect(getCrrmInterferingLinksText(status, kpi_number_of_interfering_links!))
        .toBe('Failed')
    })
  })
})

describe('Recommendation services', () => {
  const props = {
    startDate: '2023-06-10T00:00:00+08:00',
    endDate: '2023-06-17T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath,
    filter: {}
  } as const

  beforeEach(() => {
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
      {
        ...crrmListResult.recommendations[0],
        crrmInterferingLinksText: 'From 3 to 0 interfering links',
        crrmOptimizedState: crrmStates.optimized
      },
      {
        ...crrmListResult.recommendations[1],
        crrmInterferingLinksText: 'Reverted',
        crrmOptimizedState: crrmStates.nonOptimized
      },
      {
        ...crrmListResult.recommendations[2],
        crrmInterferingLinksText: '2 interfering links can be optimized to 0',
        crrmOptimizedState: crrmStates.nonOptimized
      }
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
        priority: { order: 2, label: defineMessage({ defaultMessage: 'High' }) },
        category: 'AI-Driven Cloud RRM',
        summary: 'Optimal Ch/Width and Tx power found for 5 GHz radio',
        status: 'Applied',
        statusTooltip: 'Recommendation has been successfully applied on 06/16/2023 06:05.',
        statusEnum: 'applied',
        crrmOptimizedState: crrmStates.optimized
      },
      {
        ...recommendationListResult.recommendations[1],
        scope: `vsz6 (SZ Cluster)
> EDU (Venue)`,
        type: 'Venue',
        priority: { order: 1, label: defineMessage({ defaultMessage: 'Medium' }) },
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
        priority: { order: 0, label: defineMessage({ defaultMessage: 'Low' }) },
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
