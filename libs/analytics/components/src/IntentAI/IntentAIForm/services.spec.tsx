import { omit } from 'lodash'

import { recommendationUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }         from '@acx-ui/test-utils'

import {
  mockedRecommendationApFirmware,
  mockedRecommendationCRRM,
  mockedRecommendationCRRMApplied
} from './__tests__/fixtures'
import { api, EnhancedRecommendation, RecommendationAp } from './services'

describe('recommendation services', () => {
  const recommendationPayload = {
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
    status: 'new'
  }

  const recommendationApPayload = {
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
    search: ''
  }

  describe('crrm recommendation details', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
        data: {
          recommendation: mockedRecommendationCRRM
        }
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.configRecommendationDetails.initiate({
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

  it('should return correct ap details', async () => {
    mockGraphqlQuery(recommendationUrl, 'GetAps', {
      data: {
        recommendation: {
          APs: mockedRecommendationApFirmware
        }
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.getAps.initiate(recommendationApPayload)
    )
    expect(status).toBe('fulfilled')
    expect(error).toBeUndefined()
    expect(data).toStrictEqual<RecommendationAp[]>([
      {
        name: 'RuckusAP',
        mac: '28:B3:71:27:38:E0',
        model: 'R650',
        version: 'Unknown'
      },
      {
        name: 'RuckusAP',
        mac: 'B4:79:C8:3E:7E:50',
        model: 'R550',
        version: 'Unknown'
      },
      {
        name: 'RuckusAP',
        mac: 'C8:84:8C:3E:46:B0',
        model: 'R560',
        version: 'Unknown'
      }
    ])
  })

  it('should return recommendation details with monitoring data for CRRM', async () => {
    const appliedTime = mockedRecommendationCRRMApplied.appliedTime
    jest.spyOn(Date, 'now').mockImplementation(() => {
      return new Date(appliedTime).getTime()
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: {
        recommendation: mockedRecommendationCRRMApplied
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.configRecommendationDetails.initiate({
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
  })
})
