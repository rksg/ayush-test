import { dataApiURL, store } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import { api, Payload } from './services'

describe('TrafficByRadio services', () => {
  const mockPayload: Payload = {
    path: [{ type: 'network', name: 'Network' }],
    startDate: '2025-06-16T07:23:00+05:30',
    endDate: '2025-06-17T07:23:00+05:30'
  }

  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should return correct data', async () => {
    const expectedResult = {
      network: {
        hierarchyNode: {
          timeSeries: {
            time: [
              '2025-06-16T01:00:00.000Z', '2025-06-16T02:00:00.000Z', '2025-06-16T03:00:00.000Z',
              '2025-06-16T04:00:00.000Z', '2025-06-16T05:00:00.000Z', '2025-06-16T06:00:00.000Z',
              '2025-06-16T07:00:00.000Z', '2025-06-16T08:00:00.000Z', '2025-06-16T09:00:00.000Z',
              '2025-06-16T10:00:00.000Z', '2025-06-16T11:00:00.000Z', '2025-06-16T12:00:00.000Z',
              '2025-06-16T13:00:00.000Z', '2025-06-16T14:00:00.000Z', '2025-06-16T15:00:00.000Z',
              '2025-06-16T16:00:00.000Z', '2025-06-16T17:00:00.000Z', '2025-06-16T18:00:00.000Z',
              '2025-06-16T19:00:00.000Z', '2025-06-16T20:00:00.000Z', '2025-06-16T21:00:00.000Z',
              '2025-06-16T22:00:00.000Z', '2025-06-16T23:00:00.000Z', '2025-06-17T00:00:00.000Z',
              '2025-06-17T01:00:00.000Z'
            ],
            userTraffic_all: [
              2615523125, 5508161714, 7194585324, 6221988587, 4840994181, 6525469920,
              10437759956, 5633157612, 6159403674, 7588669145, 9555165765, 4822128466,
              4873482006, 9242240485, 13020192366, 5484297851, 4371791093, 5653704950,
              6536238499, 6359210619, 5102857340, 7250374013, 7529290542, 4466315825,
              5995194658
            ],
            userTraffic_24: [
              29988707, 23852188, 20935682, 27621528, 20097666, 153122164,
              42805377, 19169804, 97370230, 23836842, 24135601, 130512780,
              57922383, 31855670, 38540345, 32743415, 28909492, 22391713,
              23558736, 24979088, 47179428, 27264012, 24716409, 25885150,
              26365964
            ],
            userTraffic_5: [
              2585534418, 5484309526, 7173649642, 6194367059, 4820896515, 6372347756,
              10394954579, 5613987808, 6062033444, 7564832303, 9531030164, 4691615686,
              4815559623, 9210384815, 12981652021, 5451554436, 4342881601, 5631313237,
              6512679763, 6334231531, 5055677912, 7223110001, 7504574133, 4440430675,
              5968828694
            ],
            userTraffic_6: [
              0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0,
              0, 0, 0
            ]
          }
        }
      }
    }

    mockGraphqlQuery(dataApiURL, 'TrafficByRadioWidget', { data: expectedResult })

    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByRadio.initiate(mockPayload)
    )
    expect(status).toBe('fulfilled')
    expect(data).toStrictEqual(expectedResult.network.hierarchyNode.timeSeries)
    expect(error).toBe(undefined)
  })

  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByRadioWidget', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.trafficByRadio.initiate({} as Payload)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
