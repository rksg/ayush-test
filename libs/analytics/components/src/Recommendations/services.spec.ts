/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { recommendationUrl, store, Provider }                              from '@acx-ui/store'
import { mockGraphqlQuery, mockGraphqlMutation, act, renderHook, waitFor } from '@acx-ui/test-utils'
import {
  DateRange,
  setUpIntl,
  NetworkPath
} from '@acx-ui/utils'

import { apiResult }                          from './__tests__/fixtures'
import { api, useMuteRecommendationMutation } from './services'

describe('Recommendation services', () => {
  const props = {
    startDate: '2023-06-10T00:00:00+08:00',
    endDate: '2023-06-17T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: [{ type: 'network', name: 'Network' }] as NetworkPath,
    filter: {}
  } as const


  const expectedResult = [
    {
      id: '1',
      code: 'c-crrm-channel5g-auto',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:05:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-1',
      metadata: {},
      isMuted: false,
      path: [
        { type: 'system', name: 'vsz611' },
        { type: 'zone', name: 'EDU-MeshZone_S12348' }
      ],
      category: 'AI-Driven Cloud RRM',
      priority: 2,
      priorityLabel: 'High',
      scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
      status: 'Applied',
      statusTooltip: 'Recommendation has been successfully applied on 06/16/2023 06:05.',
      summary: 'More optimal channel plan and channel bandwidth selection on 5 GHz radio',
      type: 'Venue'
    }, {
      id: '2',
      code: 'c-txpower-same',
      createdAt: '2023-06-13T07:05:08.638Z',
      updatedAt: '2023-06-16T06:06:02.839Z',
      sliceType: 'zone',
      sliceValue: 'zone-2',
      metadata: {
        error: {
          details: [{
            apName: 'AP',
            apMac: 'MAC',
            configKey: 'radio5g',
            message: 'unknown error'
          }]
        }
      },
      isMuted: false,
      path: [
        { type: 'system', name: 'vsz6' },
        { type: 'zone', name: 'EDU' }
      ],
      category: 'Wi-Fi Client Experience',
      priority: 1,
      priorityLabel: 'Medium',
      scope: `vsz6 (SZ Cluster)
> EDU (Venue)`,
      status: 'Revert Failed',
      statusTooltip: 'Error(s) were encountered on 06/16/2023 06:06 when the reversion was applied. Errors: AP (MAC) on 5 GHz: unknown error',
      summary: 'Tx power setting for 2.4 GHz and 5 GHz radio',
      type: 'Venue'
    },
    {
      category: 'Wi-Fi Client Experience',
      code: 'c-bandbalancing-enable',
      createdAt: '2023-06-12T07:05:14.900Z',
      id: '3',
      isMuted: true,
      metadata: {},
      mutedAt: null,
      mutedBy: '',
      path: [
        {
          name: 'vsz34',
          type: 'system'
        },
        {
          name: '27-US-CA-D27-Peat-home',
          type: 'domain'
        },
        {
          name: 'Deeps Place',
          type: 'zone'
        }
      ],
      priority: 0,
      priorityLabel: 'Low',
      scope: `vsz34 (SZ Cluster)
> 27-US-CA-D27-Peat-home (Domain)
> Deeps Place (Venue)`,
      sliceType: 'zone',
      sliceValue: 'Deeps Place',
      status: 'New',
      statusTooltip: 'Schedule a day and time to apply this recommendation.',
      summary: 'Enable band balancing',
      type: 'Venue',
      updatedAt: '2023-07-06T06:05:21.004Z'
    }
  ]

  beforeEach(() => {
    setUpIntl({
      locale: 'en-US',
      messages: {}
    })
    store.dispatch(api.util.resetApiState())
  })

  it('should return correct data', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendation', {
      data: apiResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.recommendationList.initiate(props)
    )

    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

  it('should mutate correct data', async () => {
    const resp = { toggleMute: { success: true, errorMsg: '' , errorCode: '' } }
    mockGraphqlMutation(recommendationUrl, 'MutateRecommendation', { data: resp })

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

})
