import '@testing-library/jest-dom'

import { store, dataApiURL } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'
import { FilterNameNode }    from '@acx-ui/utils'

import {
  zoneWiseSearchApi
} from './services'

export const zonesWiseSearchList = {
  network: {
    search: {
      aps: [
        {
          apName: 'R770-2',
          macAddress: 'C8:A6:08:15:43:B0',
          apModel: 'R770',
          ipAddress: '192.168.1.56',
          version: 'Unknown',
          apZone: 'APMEMv6',
          networkPath: [
            {
              name: 'Network',
              type: 'network'
            },
            {
              name: 'AP-MEM-vSZ-61',
              type: 'system'
            },
            {
              name: 'APMEMv6',
              type: 'zone'
            },
            {
              name: 'default',
              type: 'apGroup'
            },
            {
              name: 'C8:A6:08:15:43:B0',
              type: 'AP'
            }
          ]
        },
        {
          apName: 'RuckusAP',
          macAddress: '4C:B1:CD:3B:E1:60',
          apModel: 'R650',
          ipAddress: '192.168.1.52',
          version: 'Unknown',
          apZone: 'APMEMv6',
          networkPath: [
            {
              name: 'Network',
              type: 'network'
            },
            {
              name: 'AP-MEM-vSZ-61',
              type: 'system'
            },
            {
              name: 'APMEMv6',
              type: 'zone'
            },
            {
              name: 'default',
              type: 'apGroup'
            },
            {
              name: '4C:B1:CD:3B:E1:60',
              type: 'AP'
            }
          ]
        }
      ]
    }
  }
}
describe('Zones wise search API', () => {
  beforeEach(() => {
    store.dispatch(zoneWiseSearchApi.util.resetApiState())
  })

  it('Zones wise search API should return the data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: zonesWiseSearchList
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      limit: 10000,
      filter: { networkNodes: [[{ type: 'zone', name: 'test' } as FilterNameNode]] }
    }
    const { status, data, error } = await store.dispatch(
      zoneWiseSearchApi.endpoints.zoneWiseApList.initiate(payload)
    )

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(zonesWiseSearchList.network.search)
  })
})
