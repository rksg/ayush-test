/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { defaultNetworkPath }       from '@acx-ui/analytics/utils'
import { recommendationUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }         from '@acx-ui/test-utils'
import { PathFilter, DateRange }    from '@acx-ui/utils'

import {
  intentAIRecommendationListResult
} from './__tests__/fixtures'
import { api } from './services'

describe('Recommendation services', () => {
  const props = {
    startDate: '2023-06-10T00:00:00+08:00',
    endDate: '2023-06-17T00:00:00+08:00',
    range: DateRange.last24Hours,
    path: defaultNetworkPath
  } as PathFilter

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should return intentAI recommendation list', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIList', {
      data: intentAIRecommendationListResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.intentAIRecommendationList.initiate({ ...props })
    )

    const expectedResult = [
      {
        ...intentAIRecommendationListResult.intents[0],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 5 GHz radio',
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        category: 'AI-Driven Cloud RRM',
        status: 'Applied'
      },
      {
        ...intentAIRecommendationListResult.intents[1],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 5 GHz radio',
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        category: 'AI-Driven Cloud RRM',
        status: 'Revert Scheduled'
      },
      {
        ...intentAIRecommendationListResult.intents[2],
        aiFeature: 'AI Operations',
        intent: 'Optimize for 5 GHz Radio vs Longer range with 2.4 GHz',
        scope: `vsz6 (SZ Cluster)
> EDU (Venue)`,
        type: 'Venue',
        category: 'Wi-Fi Client Experience',
        status: 'Revert Failed'
      },
      {
        ...intentAIRecommendationListResult.intents[3],
        aiFeature: 'AI Operations',
        intent: 'Client Performance vs Compatibility',
        scope: `vsz34 (SZ Cluster)
> 27-US-CA-D27-Peat-home (Domain)
> Deeps Place (Venue)`,
        type: 'Venue',
        category: 'Wi-Fi Client Experience',
        status: 'New'
      },
      {
        ...intentAIRecommendationListResult.intents[4],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 2.4 GHz radio',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        category: 'AI-Driven Cloud RRM',
        status: 'New'
      },
      {
        ...intentAIRecommendationListResult.intents[5],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 2.4 GHz',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        category: 'Wi-Fi Client Experience',
        status: 'New'
      },
      {
        ...intentAIRecommendationListResult.intents[6],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 5 GHz',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        category: 'Wi-Fi Client Experience',
        status: 'New'
      },
      {
        ...intentAIRecommendationListResult.intents[7],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 6 GHz',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        type: 'Venue',
        category: 'Wi-Fi Client Experience',
        status: 'New'
      }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

})
