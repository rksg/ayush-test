/* eslint-disable max-len */
import '@testing-library/jest-dom'

import { defaultNetworkPath }    from '@acx-ui/analytics/utils'
import { intentAIUrl, store }    from '@acx-ui/store'
import { mockGraphqlQuery }      from '@acx-ui/test-utils'
import { PathFilter, DateRange } from '@acx-ui/utils'

import {
  intentListResult,
  intentListWithAllStatus } from './__tests__/fixtures'
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
        status: 'Active',
        statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone zone-1.'
      },
      {
        ...intentListResult.intents[1],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 5 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'Revert Scheduled',
        statusTooltip: 'The Revert of the IntentAI recommended changes are scheduled for 06/17/2023 00:00, via user action "Revert".'
      },
      {
        ...intentListResult.intents[2],
        aiFeature: 'AI Operations',
        intent: 'Optimize for 5 GHz Radio vs Longer range with 2.4 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz6 (SZ Cluster)
> EDU (Venue)`,
        status: 'Paused, Revert Failed',
        statusTooltip: 'The Revert action on the IntentAI recommended change, failed due to the following reason: unknown error. The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.'
      },
      {
        ...intentListResult.intents[3],
        aiFeature: 'AI Operations',
        intent: 'Client Performance vs Compatibility',
        category: 'Wi-Fi Experience',
        scope: `vsz34 (SZ Cluster)
> 27-US-CA-D27-Peat-home (Domain)
> Deeps Place (Venue)`,
        status: 'New',
        statusTooltip: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.'
      },
      {
        ...intentListResult.intents[4],
        aiFeature: 'AI-Driven RRM',
        intent: 'Client Density vs. Throughput for 2.4 GHz radio',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'New',
        statusTooltip: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.'
      },
      {
        ...intentListResult.intents[5],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 2.4 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'New',
        statusTooltip: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.'
      },
      {
        ...intentListResult.intents[6],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 5 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'New',
        statusTooltip: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.'
      },
      {
        ...intentListResult.intents[7],
        aiFeature: 'AirFlexAI',
        intent: 'Time to Connect vs. Client Density for 6 GHz',
        category: 'Wi-Fi Experience',
        scope: `vsz612 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`,
        status: 'New',
        statusTooltip: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.'
      }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

  it('should return corresponding tooltips according to different statuses', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIList', {
      data: intentListWithAllStatus
    })

    const { status, data, error } = await store.dispatch(
      api.endpoints.intentAIList.initiate({ ...props })
    )

    const expectedCommonResult = {
      aiFeature: 'AI-Driven RRM',
      intent: 'Client Density vs. Throughput for 5 GHz radio',
      category: 'Wi-Fi Experience',
      scope: `vsz611 (SZ Cluster)
> EDU-MeshZone_S12348 (Venue)`
    }

    const expectedResult = [
      {
        ...intentListWithAllStatus.intents[0],
        ...expectedCommonResult,
        status: 'New',
        statusTooltip: 'IntentAI has analyzed the data and generated a change recommendations, awaiting your approval. To review the details, specify Intent priority, and apply the recommendations, click "Optimize." Alternatively, use "1-Click Optimize" to instantly apply the changes with default priority.'
      },
      {
        ...intentListWithAllStatus.intents[1],
        ...expectedCommonResult,
        status: 'Scheduled',
        statusTooltip: 'The change recommendation has been scheduled via the user action "Optimize".'
      },
      {
        ...intentListWithAllStatus.intents[2],
        ...expectedCommonResult,
        status: 'Scheduled',
        statusTooltip: 'The change recommendation has been scheduled via the user action "1-Click Optimize".'
      },
      {
        ...intentListWithAllStatus.intents[3],
        ...expectedCommonResult,
        status: 'Scheduled',
        statusTooltip: 'The change recommendation has been automatically scheduled by IntentAI.'
      },
      {
        ...intentListWithAllStatus.intents[4],
        ...expectedCommonResult,
        status: 'Apply In Progress',
        statusTooltip: 'IntentAI recommended changes are getting applied to the zone zone-1.'
      },
      {
        ...intentListWithAllStatus.intents[5],
        ...expectedCommonResult,
        status: 'Active',
        statusTooltip: 'IntentAI is active and has successfully applied the changes to the zone zone-1.'
      },
      {
        ...intentListWithAllStatus.intents[6],
        ...expectedCommonResult,
        status: 'Paused, Applied Failed',
        statusTooltip: 'IntentAI recommended changes failed to apply to the zone zone-1 due to: unknown error. The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.'
      },
      {
        ...intentListWithAllStatus.intents[7],
        ...expectedCommonResult,
        status: 'Revert Scheduled',
        statusTooltip: 'The Revert of the IntentAI recommended changes are scheduled for 06/17/2023 00:00, via user action "Revert".'
      },
      {
        ...intentListWithAllStatus.intents[8],
        ...expectedCommonResult,
        status: 'Revert In Progress',
        statusTooltip: 'IntentAI recommended changes are getting reverted, to the earlier configuration, on the zone zone-1.'
      },
      {
        ...intentListWithAllStatus.intents[9],
        ...expectedCommonResult,
        status: 'Paused, Revert Failed',
        statusTooltip: 'The Revert action on the IntentAI recommended change, failed due to the following reason: unknown error. The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.'
      },
      {
        ...intentListWithAllStatus.intents[10],
        ...expectedCommonResult,
        status: 'Paused, Revert Success',
        statusTooltip: 'The intent is currently paused. To process new data and generate updated recommendations using ML algorithms, please select the "Resume" action.'
      },
      {
        ...intentListWithAllStatus.intents[11],
        ...expectedCommonResult,
        status: 'Paused',
        statusTooltip: 'The Intent is paused by the user action "Pause". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.'
      },
      {
        ...intentListWithAllStatus.intents[12],
        ...expectedCommonResult,
        status: 'Paused',
        statusTooltip: 'The Intent is paused by the user action "Pause". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.'
      },
      {
        ...intentListWithAllStatus.intents[13],
        ...expectedCommonResult,
        status: 'Paused',
        statusTooltip: 'The Intent is in default state of "Paused". A Paused Intent will refrain from executing any tasks, including KPI measurement, ML model generations, recommendation generation and configuration changes.'
      },
      {
        ...intentListWithAllStatus.intents[14],
        ...expectedCommonResult,
        status: 'No recommendation, Conflicting Configuration',
        statusTooltip: 'No recommendation was generated because IntentAI detected conflicting configurations. Conflict: Mesh APs are present in the zone.'
      },
      {
        ...intentListWithAllStatus.intents[15],
        ...expectedCommonResult,
        status: 'No recommendation, No APs',
        statusTooltip: 'No recommendation was generated because IntentAI found no APs in the zone zone-1.'
      },
      {
        ...intentListWithAllStatus.intents[16],
        ...expectedCommonResult,
        status: 'No recommendation, Not enough license',
        statusTooltip: 'No recommendation was generated because IntentAI did not find sufficient licenses for the zone zone-1.'
      },
      {
        ...intentListWithAllStatus.intents[17],
        ...expectedCommonResult,
        status: 'No recommendation, Not enough data',
        statusTooltip: 'No recommendation was generated because IntentAI found less than 4 days of data in the zone zone-1.'
      },
      {
        ...intentListWithAllStatus.intents[18],
        ...expectedCommonResult,
        status: 'Verified',
        statusTooltip: 'IntentAI has validated zone zone-1 configurations. No new changes have been recommended.'
      },
      {
        ...intentListWithAllStatus.intents[19],
        ...expectedCommonResult,
        status: 'No recommendation',
        statusTooltip: 'No recommendation available. Awaiting data processing and recommendation generation by ML algorithms.'
      }
    ]
    expect(error).toBe(undefined)
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult)
  })

})
