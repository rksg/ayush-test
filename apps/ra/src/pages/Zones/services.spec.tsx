import '@testing-library/jest-dom'

import { store, dataApiURL } from '@acx-ui/store'
import { mockGraphqlQuery }  from '@acx-ui/test-utils'

import {
  zonesListApi
} from './services'

export const zonesList = {
  network: {
    zones: [
      {
        systemName: 'systemName 1',
        domain: 'domain 1',
        zoneName: 'zoneName 1',
        apCount: 'apCount 1',
        clientCount: 'clientCount 1'
      },
      {
        systemName: 'systemName 2',
        domain: 'domain 2',
        zoneName: 'zoneName 2',
        apCount: 'apCount 2',
        clientCount: 'clientCount 2'
      },
      {
        systemName: 'systemName 3',
        domain: 'domain 3',
        zoneName: 'zoneName 3',
        apCount: 'apCount 3',
        clientCount: 'clientCount 3'
      }
    ]
  }
}
describe('Zones list API', () => {
  beforeEach(() => {
    store.dispatch(zonesListApi.util.resetApiState())
  })

  it('zones list api should return the data', async () => {
    mockGraphqlQuery(dataApiURL, 'ZonesList', {
      data: zonesList
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      zonesListApi.endpoints.zonesList.initiate(payload)
    )

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(zonesList.network)
  })
})
