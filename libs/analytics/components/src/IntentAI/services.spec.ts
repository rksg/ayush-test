/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { defaultNetworkPath }    from '@acx-ui/analytics/utils'
import { intentAIUrl, store }    from '@acx-ui/store'
import { mockGraphqlQuery }      from '@acx-ui/test-utils'
import { PathFilter, DateRange } from '@acx-ui/utils'

import {
  intentListResult
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

  it('should return intentAI list', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: intentListResult
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.intentAIList.initiate({ ...props })
    )

    const expectedResult = [
      {
        ...intentListResult.intents[0],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 5 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'Applied'
      },
      {
        ...intentListResult.intents[1],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 5 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'Revert Scheduled'
      },
      {
        ...intentListResult.intents[2],
        aiFeature: 'AI Operations',
        intent: 'Optimize for 5 GHz Radio vs Longer range with 2.4 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz6 (SZ Cluster)
> EDU (Venue)`,
        status: 'Revert Failed'
      },
      {
        ...intentListResult.intents[3],
        aiFeature: 'AI Operations',
        intent: 'Client Performance vs Compatibility',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 27-US-CA-D27-Peat-home (Domain)
> Deeps Place (Venue)`,
        status: 'New'
      },
      {
        ...intentListResult.intents[4],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'New'
      },
      {
        ...intentListResult.intents[5],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 2.4 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'New'
      },
      {
        ...intentListResult.intents[6],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 5 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12349 (Venue)`,
        status: 'New'
      },
      {
        ...intentListResult.intents[7],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 6 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'New'
      },
      {
        ...intentListResult.intents[8],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 01-US-CA-D1-Test-Home (Domain)
> 01-Alethea-WiCheck Test (Venue)`,
        status: 'No recommendation, Not enough license'
      },
      {
        ...intentListResult.intents[9],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 22-US-CA-D22-Aaron-Home (Domain)
> 22-US-CA-Z22-Aaron-Home (Venue)`,
        status: 'No recommendation, Not enough data'
      },
      {
        ...intentListResult.intents[10],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 01-US-CA-D1-Test-Home (Domain)
> 01-US-CA-D1-Ruckus-HQ-QA-interop (Venue)`,
        status: 'Verified'
      },
      {
        ...intentListResult.intents[11],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 23-IND-BNG-D23-Keshav-Home (Domain)
> 23-IND-BNG-D23-Keshav-Home (Venue)`,
        status: 'No recommendation, Conflicting Configuration'
      },
      {
        ...intentListResult.intents[12],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz-h-bdc-home-network-05 (SZ Cluster)
> 22-US-CA-Z22-Aaron-Home (Venue)`,
        status: 'No recommendation, Unknown reason'
      },
      {
        ...intentListResult.intents[13],
        aiFeature: 'AI Operations',
        intent: 'Dynamic vs Static Channel capability on 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 25-US-CA-D25-SandeepKour-home (Domain)
> 25-US-CA-D25-SandeepKour-home (Venue)`,
        status: 'No recommendation, No APs'
      }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

})
