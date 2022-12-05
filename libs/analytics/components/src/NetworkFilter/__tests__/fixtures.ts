import { defaultNetworkPath } from '@acx-ui/analytics/utils'

export const networkHierarchy = {
  children: [{
    id: 'id1',
    type: 'zone',
    name: 'venue',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue' }],
    aps: [{ name: 'ap', mac: 'ap-mac' }],
    switches: []
  }, {
    id: 'id2',
    type: 'switchGroup',
    name: 'venue',
    path: [...defaultNetworkPath, { type: 'switchGroup', name: 'venue' }],
    aps: [],
    switches: [{ name: 'switch', mac: 'switch-mac' }]
  }, {
    id: 'id3',
    type: 'zone',
    name: 'venue1',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue1' }],
    aps: [{ name: 'ap2', mac: 'ap-mac2' }],
    switches: []
  }, {
    id: 'id4',
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
