import { omit } from 'lodash'

import { recommendationUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery }         from '@acx-ui/test-utils'

import {
  mockedRecommendationFirmware,
  mockedRecommendationApFirmware,
  mockedRecommendationCRRM
} from './__tests__/fixtures'
import { api, EnhancedRecommendation, RecommendationAp } from './services'


describe('recommendation services', () => {
  const recommendationPayload = {
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf'
  }

  const recommendationApPayload = {
    id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
    search: ''
  }

  it('should return correct recommendation details', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: {
        recommendation: mockedRecommendationFirmware
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recommendationDetails.initiate({
        ...recommendationPayload,
        code: 'i-zonefirmware-upgrade'
      })
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
      appliedOnce: false,
      appliedTime: null,
      code: 'i-zonefirmware-upgrade',
      currentValue: '6.1.1.0.1274',
      id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
      kpi_aps_on_latest_fw_version: {
        current: [0, 0],
        previous: null,
        projected: null
      },
      metadata: {},
      monitoring: null,
      originalValue: null,
      path: [
        { name: 'vsz34', type: 'system' },
        { name: '39-IND-BDC-D39-Mayank', type: 'domain' },
        { name: '39-IND-BDC-D39-Mayank-Ofc-Z2', type: 'zone' }
      ],
      recommendedValue: '6.1.2',
      sliceType: 'zone',
      sliceValue: '39-IND-BDC-D39-Mayank-Ofc-Z2',
      status: 'new',
      statusTrail: [{
        createdAt: '2023-06-12T07:05:14.106Z',
        status: 'new'
      }]
    } as unknown as EnhancedRecommendation)
  })

  it('should return correct details with code', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: {
        recommendation: mockedRecommendationFirmware
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recommendationDetails.initiate({
        ...recommendationPayload,
        code: 'c-aclb-enable'
      })
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
      appliedOnce: false,
      appliedTime: null,
      code: 'i-zonefirmware-upgrade',
      currentValue: '6.1.1.0.1274',
      id: '5a4c8253-a2cb-485b-aa81-5ec75db9ceaf',
      kpi_aps_on_latest_fw_version: {
        current: [0, 0],
        previous: null,
        projected: null
      },
      metadata: {},
      monitoring: null,
      originalValue: null,
      path: [
        { name: 'vsz34', type: 'system' },
        { name: '39-IND-BDC-D39-Mayank', type: 'domain' },
        { name: '39-IND-BDC-D39-Mayank-Ofc-Z2', type: 'zone' }
      ],
      recommendedValue: '6.1.2',
      sliceType: 'zone',
      sliceValue: '39-IND-BDC-D39-Mayank-Ofc-Z2',
      status: 'new',
      statusTrail: [{
        createdAt: '2023-06-12T07:05:14.106Z',
        status: 'new'
      }]
    } as unknown as EnhancedRecommendation)
  })

  it('should return correct crrm recommendation details', async () => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: {
        recommendation: mockedRecommendationCRRM
      }
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.recommendationDetails.initiate(recommendationPayload)
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
      appliedTime: '2023-06-25T00:00:25.772Z',
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
      recommendedValue: 'crrm',
      sliceType: 'zone',
      sliceValue: '21_US_Beta_Samsung',
      status: 'applyscheduled',
      kpi_number_of_interfering_links: {
        current: 0,
        previous: null,
        projected: 0
      },
      statusTrail: mockedRecommendationCRRM.statusTrail
    } as unknown as EnhancedRecommendation)
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
})