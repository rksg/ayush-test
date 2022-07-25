import { configureStore } from '@reduxjs/toolkit'

import { dataApi, dataApiURL } from '@acx-ui/analytics/services'
import { mockGraphqlQuery }    from '@acx-ui/test-utils'

import { api } from './services'

export const input = [{
  path: [{ type: 'network', name: 'Network' }],
  queryResult: {
    network: {
      node: {
        type: 'network', name: 'Network', apCount: 50, clientCount: 100, switchCount: null
      }
    }
  },
  transformedResult: {
    title: 'Network',
    subTitle: [
      { key: 'Type', value: ['Network'] },
      { key: 'APs', value: [50] },
      { key: 'Clients', value: [100] }
    ]
  }
}, {
  path: [{ type: 'network', name: 'Network' }, { type: 'zone', name: 'Venue' }],
  queryResult: {
    network: {
      node: {
        type: 'zone', name: 'Venue', apCount: 50, clientCount: 100
      }
    }
  },
  transformedResult: {
    title: 'Venue',
    subTitle: [
      { key: 'Type', value: ['Venue'] },
      { key: 'APs', value: [50] },
      { key: 'Clients', value: [100] }
    ]
  }
}, {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'zone', name: 'Venue' },
    { type: 'apGroup', name: 'AP Group' }
  ],
  queryResult: {
    network: {
      node: {
        type: 'apGroup', name: 'AP Group', apCount: 50, clientCount: 100
      }
    }
  },
  transformedResult: {
    title: 'AP Group',
    subTitle: [
      { key: 'Type', value: ['AP Group'] },
      { key: 'APs', value: [50] },
      { key: 'Clients', value: [100] }
    ]
  }
}, {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'zone', name: 'Venue' },
    { type: 'apGroup', name: 'AP Group' },
    { type: 'AP', name: 'Access Point' }
  ],
  queryResult: {
    network: {
      node: {
        type: 'AP', name: 'Access Point', clientCount: 100,
        model: ['r710'], version: ['Unknown', '1'], mac: 'AA', internalIp: ['ip1', 'ip2']
      }
    }
  },
  transformedResult: {
    title: 'Access Point',
    subTitle: [
      { key: 'Type', value: ['Access Point'] },
      { key: 'Clients', value: [100] },        
      { key: 'Model', value: ['r710'] },
      { key: 'Firmware', value: ['1', 'Unknown'] },
      { key: 'MAC Address', value: ['AA'] },        
      { key: 'IP Address', value: ['ip2', 'ip1'] }
    ]
  }
}, {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'switchGroup', name: 'Switch Group' }
  ],
  queryResult: {
    network: {
      node: {
        type: 'switchGroup', name: 'Switch Group', switchCount: 100
      }
    }
  },
  transformedResult: {
    title: 'Switch Group',
    subTitle: [
      { key: 'Type', value: ['Venue'] },
      { key: 'Switches', value: [100] }
    ]
  }
}, {
  path: [
    { type: 'network', name: 'Network' },
    { type: 'switchGroup', name: 'Switch Group' },
    { type: 'switch', name: 'Switch' }
  ],
  queryResult: {
    network: {
      node: {
        type: 'switch', name: 'Switch', model: 'm',
        firmware: '123', portCount: 20
      }
    }
  },
  transformedResult: {
    title: 'Switch',
    subTitle: [
      { key: 'Type', value: ['Switch'] },
      { key: 'Model', value: ['m'] },
      { key: 'Firmware', value: ['123'] },
      { key: 'Ports', value: [20] }     
    ]
  }
}]
describe('NetworkNodeInfo', () => {
  const store = configureStore({
    reducer: {
      [dataApi.reducerPath]: dataApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([dataApi.middleware])
  })
  const props = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }]
  }
  afterEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  input.forEach(({ path, queryResult, transformedResult }) => {
    it(`should return correct data for ${transformedResult.title}`, async () => {
      mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
        data: queryResult
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.networkNodeInfo.initiate({ ...props, path })
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(transformedResult)
      expect(error).toBe(undefined)
    })
  })
  it('should return error', async () => {
    mockGraphqlQuery(dataApiURL, 'NetworkNodeInfo', {
      error: new Error('something went wrong!')
    })
    const { status, data, error } = await store.dispatch(
      api.endpoints.networkNodeInfo.initiate(props)
    )
    expect(status).toBe('rejected')
    expect(data).toBe(undefined)
    expect(error).not.toBe(undefined)
  })
})
