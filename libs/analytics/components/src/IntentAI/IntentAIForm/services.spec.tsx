import { omit, pick } from 'lodash'

import { recommendationUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }         from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationCRRMApplied
} from '../IntentAIDetails/__tests__/fixtures'

import { api, EnhancedRecommendation, kpiHelper } from './services'

describe('recommendation services', () => {
  const recommendationPayload = {
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
    status: 'new'
  }

  describe('crrm recommendation code', () => {
    it('should return correct value', async () => {
      mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationCode', {
        data: { recommendation: pick(mockedRecommendationCRRM, ['id', 'code']) }
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.recommendationCode.initiate({
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
        trigger: 'daily',
        crrmInterferingLinks: {
          after: 0,
          before: 2
        }
      } as unknown as EnhancedRecommendation)
    })
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

describe('kpiHelper', () => {
  it('should return correct kpi', () => {
    const code = 'c-crrm-channel24g-auto'
    const kpi = kpiHelper(code)
    const result = kpi.includes('kpi_number_of_interfering_links')
    expect(result).toEqual(true)
  })
})
