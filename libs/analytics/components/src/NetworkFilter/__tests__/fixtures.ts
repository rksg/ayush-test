/* eslint-disable max-len */
import { defaultNetworkPath } from '@acx-ui/analytics/utils'

export const networkFilterResult = {
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
  },
  {
    id: 'id5',
    type: 'switchGroup',
    name: 'swg1',
    path: [...defaultNetworkPath, { type: 'switchGroup', name: 'swg1' }],
    aps: [{ name: 'ap3', mac: 'ap-mac3' }],
    switches: [{ name: 'switch3', mac: 'switch-mac3' }]
  }
  ],
  name: 'Network',
  type: 'network',
  path: defaultNetworkPath
}

export const recentNetworkFilterResult = {
  children: [{
    id: 'id1',
    type: 'zone',
    name: 'venue1',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue1' }],
    aps: [
      { name: 'ap', mac: 'ap-mac', model: 'E510', firmware: '6.2.1.103.2538', serial: '431802006000' }
    ]
  },
  {
    id: 'id2',
    type: 'zone',
    name: 'venue2',
    path: [...defaultNetworkPath, { type: 'zone', name: 'venue2' }],
    aps: [{ name: 'ap2', mac: 'ap-mac2', model: 'E510', firmware: '6.2.1.103.2538', serial: '431802006001' }]
  }],
  name: 'Network',
  type: 'network',
  path: defaultNetworkPath
}

export const hierarchyQueryResult = {
  network: {
    apHierarchy: [
      {
        name: 'test-system',
        type: 'system',
        children: [
          {
            name: '1||Administration Domain',
            type: 'domain',
            children: [
              {
                name: 'child under admin',
                type: 'zone',
                children: [
                  {
                    name: 'group 1',
                    type: 'apGroup'
                  }
                ]
              }
            ]
          }, {
            name: '2||second domain',
            type: 'domain',
            children: [
              {
                name: 'zone 1',
                type: 'zone'
              }
            ]
          }
        ]
      }
    ],
    switchHierarchy: [
      {
        name: 'test-system',
        type: 'system',
        children: [
          {
            name: '1||Administration Domain',
            type: 'domain'
          },
          {
            name: '2||second domain',
            type: 'domain',
            children: [
              {
                name: 'switchGroup 1',
                type: 'switchGroup'
              }
            ]
          }
        ]
      },
      {
        name: 'some-other system',
        type: 'system'
      }
    ]
  }
}

export const fullHierarchyQueryOuput = {
  type: 'network',
  name: 'Network',
  children: [
    {
      name: 'test-system',
      type: 'system',
      children: [
        {
          name: 'second domain',
          type: 'domain',
          children: [
            {
              name: 'zone 1',
              type: 'zone'
            },
            {
              name: 'switchGroup 1',
              type: 'switchGroup'
            }
          ]
        },
        {
          name: 'child under admin',
          type: 'zone',
          children: [
            {
              name: 'group 1',
              type: 'apGroup'
            }
          ]
        }
      ]
    },
    {
      name: 'some-other system',
      type: 'system'
    }
  ]
}

export const apsOnlyHierarchyQueryOuput = {
  type: 'network',
  name: 'Network',
  children: [
    {
      name: 'test-system',
      type: 'system',
      children: [
        {
          name: 'second domain',
          type: 'domain',
          children: [
            {
              name: 'zone 1',
              type: 'zone'
            }
          ]
        },
        {
          name: 'child under admin',
          type: 'zone',
          children: [
            {
              name: 'group 1',
              type: 'apGroup'
            }
          ]
        }
      ]
    }
  ]
}