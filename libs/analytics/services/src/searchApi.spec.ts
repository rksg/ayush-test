import '@testing-library/jest-dom'

import { store, dataApiSearchURL, dataApiURL } from '@acx-ui/store'
import { mockGraphqlQuery }                    from '@acx-ui/test-utils'
import { RaiPermissions, setRaiPermissions }   from '@acx-ui/user'

import {
  apListFixture,
  searchFixture,
  switchListFixture,
  wifiNetworksFixture,
  clientNetworksFixture
} from './__tests__/fixtures'
import { searchApi, networkSearchApi } from './searchApi'

describe('Search API', () => {

  beforeEach(() => {
    store.dispatch(searchApi.util.resetApiState())
    setRaiPermissions({
      READ_ACCESS_POINTS_LIST: true,
      READ_INCIDENTS: true,
      READ_CLIENT_TROUBLESHOOTING: true,
      READ_SWITCH_LIST: true,
      READ_WIFI_NETWORKS_LIST: true
    } as RaiPermissions)
  })

  it('search api should return the data', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchFixture
    })
    const searchPayload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      searchApi.endpoints.search.initiate(searchPayload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(searchFixture.search)
  })

  it('report-only: search api should return the data', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: {
        search: {
          aps: searchFixture.search.aps
        }
      }
    })
    const searchPayload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      limit: 100
    }
    setRaiPermissions({
      READ_ACCESS_POINTS_LIST: true,
      READ_INCIDENTS: true,
      READ_CLIENT_TROUBLESHOOTING: true,
      READ_SWITCH_LIST: false,
      READ_WIFI_NETWORKS_LIST: true
    } as RaiPermissions)
    const { status, data, error } = await store.dispatch(
      searchApi.endpoints.search.initiate(searchPayload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject({
      aps: searchFixture.search.aps
    })
  })

  it('apList api should return the data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: apListFixture
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      metric: 'traffic',
      query: 'sometext',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      networkSearchApi.endpoints.apList.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(apListFixture.network.search)
  })

  it('switchList api should return the data', async () => {
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: switchListFixture
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      metric: 'traffic',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      searchApi.endpoints.switchList.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(switchListFixture.search)
  })

  it('wifiNetworks api should return the data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: wifiNetworksFixture
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: 'sometext',
      metric: 'traffic',
      limit: 100
    }
    const { status, data, error } = await store.dispatch(
      networkSearchApi.endpoints.networkList.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(wifiNetworksFixture.network.search)
  })

  it('clientNetworks api should return the data', async () => {
    mockGraphqlQuery(dataApiURL, 'Network', {
      data: {
        network: clientNetworksFixture
      }
    })
    const payload = {
      start: '2023-04-06T15:26:21+05:30',
      end: '2023-04-06T15:29:48+05:30',
      query: '',
      limit: 100,
      filter: {}
    }
    const { status, data, error } = await store.dispatch(
      networkSearchApi.endpoints.networkClientList.initiate(payload))

    expect(error).toBeUndefined()
    expect(status).toBe('fulfilled')
    expect(data).toMatchObject(clientNetworksFixture.search)
  })
})
