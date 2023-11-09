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
      wifiNetworks: [
        {
          name: 'DENSITY',
          apCount: 16,
          clientCount: 82,
          zoneCount: 1,
          traffic: 233499556363,
          rxBytes: 10655588381,
          txBytes: 222843967982
        },
        {
          name: 'DENSITY-NSS',
          apCount: 14,
          clientCount: 7,
          zoneCount: 1,
          traffic: 11900651551,
          rxBytes: 238665993,
          txBytes: 11661985558
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
      limit: 1000,
      filter: { networkNodes: [[{ type: 'zone', name: 'test' } as FilterNameNode]] }
    }
    const { status, data, error } = await store.dispatch(
      zoneWiseSearchApi.endpoints.zoneWiseNetworkList.initiate(payload)
    )

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(zonesWiseSearchList.network.search)
  })
})
