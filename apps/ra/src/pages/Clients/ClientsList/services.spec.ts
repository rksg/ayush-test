import '@testing-library/jest-dom'

import { store, dataApiSearchURL } from '@acx-ui/store'
import { mockGraphqlQuery }        from '@acx-ui/test-utils'

import {
  clientListApi
} from './services'

export const clientsList = {
  search: {
    clients: [
      {
        hostname: '02AA01AB50120H4M',
        username: '18b43003e603',
        mac: '18:B4:30:03:E6:03',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.42',
        lastActiveTime: '2023-08-23T05:08:20.000Z'
      },
      {
        hostname: '02AA01AB50120E2Q',
        username: '18b43004d810',
        mac: '18:B4:30:04:D8:10',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.44',
        lastActiveTime: '2023-08-23T05:07:23.000Z'
      },
      {
        hostname: '02AA01AB50120G7G',
        username: '18b430051cbe',
        mac: '18:B4:30:05:1C:BE',
        osType: 'Nest Learning Thermostat',
        ipAddress: '10.0.1.69',
        lastActiveTime: '2023-08-23T05:07:23.000Z'
      }
    ]
  }
}
describe('Client list API', () => {
  beforeEach(() => {
    store.dispatch(clientListApi.util.resetApiState())
  })

  it('search api should return the data', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: clientsList
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      clientListApi.endpoints.clientList.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(clientsList.search)
  })
})
