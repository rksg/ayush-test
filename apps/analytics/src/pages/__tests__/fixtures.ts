import { defaultNetworkPath } from '@acx-ui/analytics/utils'

export const networkHierarchy = {
  children: [{
    type: 'zone',
    name: 'venue',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue' }],
    aps: [{ name: 'ap', mac: 'ap-mac' }],
    switches: []
  }, {
    type: 'switchGroup',
    name: 'venue',
    path: [...defaultNetworkPath, { type: 'switchGroup', name: 'venue' }],
    aps: [],
    switches: [{ name: 'switch', mac: 'switch-mac' }]
  }, {
    type: 'zone',
    name: 'venue1',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue1' }],
    aps: [{ name: 'ap2', mac: 'ap-mac2' }],
    switches: []
  }, {
    type: 'switchGroup',
    name: 'swg',
    path: [...defaultNetworkPath, { type: 'switchGroup', name: 'swg' }],
    aps: [],
    switches: [{ name: 'switch2', mac: 'switch-mac2' }]
  }],
  name: 'Network',
  type: 'network',
  path: defaultNetworkPath
}

export const header = {
  path: [{ type: 'network', name: 'Network' }],
  queryResult: {
    network: {
      node: {
        apCount: 50, clientCount: 100, switchCount: null
      }
    }
  },
  name: 'Network',
  transformedResult: {
    name: undefined,
    subTitle: [
      { key: 'apCount', value: [50] },
      { key: 'clientCount', value: [100] }
    ]
  }
}
