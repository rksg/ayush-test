import { dataApiURL }       from '@acx-ui/analytics/services'
import { AnalyticsFilter }  from '@acx-ui/analytics/utils'
import { store }            from '@acx-ui/store'
import { mockGraphqlQuery } from '@acx-ui/test-utils'

import { api } from './services'

describe('didYouKnowApi', () => {
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    filter: {}
  } as AnalyticsFilter
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )
  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          facts: [
            {
              key: 'topApplicationsByClients',
              values: [],
              labels: [
                'dns',
                'google_api',
                'google_gen'
              ]
            },
            {
              key: 'airtimeUtilization',
              values: [
                0.5162881637357261,
                0.10058939456970593,
                0.05814770489530424,
                -0.11135340978880626,
                0.0013129085638569071,
                -0.026368198420163663
              ],
              labels: []
            },
            {
              key: 'userTrafficThroughAPs',
              values: [
                0.9653855715231734
              ],
              labels: []
            },
            {
              key: 'topIncidentsZones',
              values: [],
              labels: [
                '760-AP',
                'Divya-1',
                'R760_AP_SV'
              ]
            },
            {
              key: 'avgSessionDuration',
              values: [
                2471593.4426229508
              ],
              labels: []
            },
            {
              key: 'busiestSsidByClients',
              values: [
                0.3173076923076923
              ],
              labels: [
                'CIOT_WPA2'
              ]
            },
            {
              key: 'busiestSsidByTraffic',
              values: [
                0.2561407629845357
              ],
              labels: [
                'wp3'
              ]
            },
            {
              key: 'topApplicationsByTraffic',
              values: [],
              labels: [
                'Youtube.com',
                'common-internet-file-system',
                'windows_update'
              ]
            }
          ]
        }
      }
    }
    mockGraphqlQuery(dataApiURL, 'DidYouKnowWidget', {
      data: expectedResult
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.didYouKnow.initiate(props)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.facts)
    expect(error).toBe(undefined)
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'DidYouKnowWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.didYouKnow.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
