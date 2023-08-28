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

export const incidentQueryResult = {
  network: {
    hierarchyNode: {
      incidents: [
        {
          severity: 0.43816840329887413,
          startTime: '2023-08-20T07:39:00.000Z',
          endTime: '2023-08-20T07:45:00.000Z',
          code: 'i-apserv-downtime-high',
          sliceType: 'zone',
          sliceValue: 'Default Zone',
          id: '3e435871-a5e4-4406-ac7d-958cb7b0785f',
          path: [
            {
              type: 'system',
              name: 'Alphanet-BDC'
            }
          ],
          metadata: {
            dominant: {},
            rootCauseChecks: {
              checks: [],
              params: {}
            }
          },
          clientCount: -1,
          impactedClientCount: -1,
          isMuted: false,
          mutedBy: null,
          mutedAt: null
        },
        {
          severity: 0.43816840329887413,
          startTime: '2023-08-20T07:39:00.000Z',
          endTime: '2023-08-20T07:45:00.000Z',
          code: 'i-apserv-downtime-high',
          sliceType: 'ap',
          sliceValue: 'R750-Solution-1',
          id: '0e96b33b-f54f-4c6e-8723-bef21130b3e8',
          path: [
            {
              type: 'system',
              name: 'BDC-Mini-Density'
            },
            {
              type: 'domain',
              name: 'BDC Domain'
            },
            {
              name: 'Solution LAB',
              type: 'zone'
            },
            {
              name: 'default',
              type: 'apGroup'
            }
          ],
          metadata: {
            dominant: {},
            rootCauseChecks: {
              checks: [],
              params: {}
            }
          },
          clientCount: -1,
          impactedClientCount: -1,
          isMuted: false,
          mutedBy: null,
          mutedAt: null
        },
        {
          severity: 0.99000,
          startTime: '2023-08-20T07:39:00.000Z',
          endTime: '2023-08-20T07:45:00.000Z',
          code: 'i-apserv-downtime-high',
          sliceType: 'apGroup',
          sliceValue: 'default',
          id: '0e96b33b-f54f-4c6e-8723-bef21130b3e8',
          path: [
            {
              name: 'density-vsze-cluster',
              type: 'system'
            },
            {
              name: 'Density',
              type: 'switchGroup'
            },
            {
              name: 'west-density-7650-stack',
              type: 'switch',
              mac: '60:9C:9F:52:C9:86'
            }
          ],
          metadata: {
            dominant: {},
            rootCauseChecks: {
              checks: [],
              params: {}
            }
          },
          clientCount: -1,
          impactedClientCount: -1,
          isMuted: false,
          mutedBy: null,
          mutedAt: null
        }
      ]
    }
  }
}

export const hierarchyQueryResult = {
  network: {
    apHierarchy: [
      {
        name: 'Alphanet-BDC',
        type: 'system',
        children: [
          {
            name: '1||Administration Domain',
            type: 'domain',
            children: [
              {
                name: 'AlphaNet_5_1',
                type: 'zone',
                children: [
                  {
                    name: 'default',
                    type: 'apGroup',
                    children: [
                      [
                        {
                          name: 'W-04',
                          type: 'ap',
                          mac: '0C:F4:D5:13:3A:F0'
                        },
                        {
                          name: 'E-02-BKP',
                          type: 'ap',
                          mac: '0C:F4:D5:18:40:30'
                        }
                      ]
                    ]
                  }
                ]
              },
              {
                name: 'Default Zone',
                type: 'zone',
                children: [
                  {
                    name: 'default',
                    type: 'apGroup',
                    children: [
                      [
                        {
                          name: 'W-04',
                          type: 'ap',
                          mac: '0C:F4:D5:13:3A:F0'
                        }
                      ]
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'BDC-Mini-Density',
        type: 'system',
        children: [
          {
            name: '2||BDC Domain',
            type: 'domain',
            children: [
              {
                name: 'Solution LAB',
                type: 'zone',
                children: [
                  {
                    name: 'default',
                    type: 'apGroup',
                    children: [
                      [
                        {
                          name: 'R550-Solution-2',
                          type: 'ap',
                          mac: '00:E6:3A:1E:5C:60'
                        },
                        {
                          name: 'R750-Solution-1',
                          type: 'ap',
                          mac: '28:B3:71:2B:D8:30'
                        }
                      ]
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    switchHierarchy: [
      {
        name: 'Alphanet-BDC',
        type: 'system',
        children: [
          {
            name: '1||Administration Domain',
            type: 'domain',
            children: [
              {
                name: 'Default Group',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'ICX8200-C08ZP Router',
                      type: 'switch',
                      mac: '94:B3:4F:2F:7D:0A'
                    },
                    {
                      name: 'ICX8200-48ZP2 Router',
                      type: 'switch',
                      mac: '94:B3:4F:2F:C6:4E'
                    }
                  ]
                ]
              },
              {
                name: 'EASTBLOCK',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'ICX7450-32ZP Router',
                      type: 'switch',
                      mac: '60:9C:9F:1D:D3:30'
                    }
                  ]
                ]
              },
              {
                name: 'WESTBLOCK',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'ICX7150-C12 Router',
                      type: 'switch',
                      mac: '58:FB:96:0B:12:CA'
                    }
                  ]
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'ICXM-Scale',
        type: 'system',
        children: [
          {
            name: '2||SQA Sunnyvale',
            type: 'domain',
            children: [
              {
                name: 'MDU Chamber',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'Access-Wired',
                      type: 'switch',
                      mac: '78:A6:E1:1C:83:24'
                    }
                  ]
                ]
              },
              {
                name: 'Managed Switches',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'NET35XX-CORE',
                      type: 'switch',
                      mac: '60:9C:9F:22:E8:80'
                    }
                  ]
                ]
              },
              {
                name: 'NET37XX',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'NET37XX-CORE',
                      type: 'switch',
                      mac: '8C:7A:15:3C:DC:28'
                    }
                  ]
                ]
              },
              {
                name: 'OLT-Commscope',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'OLT-Access-ONU1',
                      type: 'switch',
                      mac: '60:9C:9F:FE:5B:78'
                    },
                    {
                      name: 'OLT-7550-Distribution',
                      type: 'switch',
                      mac: '8C:7A:15:3C:CA:1C'
                    }
                  ]
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'density-vsze-cluster',
        type: 'system',
        children: [
          {
            name: '1||Administration Domain',
            type: 'domain',
            children: [
              {
                name: 'Density',
                type: 'switchGroup',
                children: [
                  [
                    {
                      name: 'west-density-7650-stack',
                      type: 'switch',
                      mac: '60:9C:9F:52:C9:86'
                    },
                    {
                      name: 'east-icxstack-density',
                      type: 'switch',
                      mac: '60:9C:9F:FE:56:42'
                    },
                    {
                      name: 'density-main-switch',
                      type: 'switch',
                      mac: '60:9C:9F:FE:64:14'
                    }
                  ]
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}

export const hierarchyQueryOuput = {
  network: {
    apHierarchy: [
      {
        name: 'Alphanet-BDC',
        type: 'system',
        children: [
          {
            name: 'AlphaNet_5_1',
            type: 'zone',
            parentKey: [
              'Alphanet-BDC',
              'children'
            ],
            children: [
              {
                name: 'default',
                type: 'apGroup',
                parentKey: [
                  'Alphanet-BDC',
                  'children',
                  'AlphaNet_5_1',
                  'children'
                ],
                children: [
                  [
                    {
                      name: 'W-04',
                      type: 'ap',
                      mac: '0C:F4:D5:13:3A:F0',
                      parentKey: [
                        'Alphanet-BDC',
                        'children',
                        'AlphaNet_5_1',
                        'children',
                        'default',
                        'children'
                      ]
                    },
                    {
                      name: 'E-02-BKP',
                      type: 'ap',
                      mac: '0C:F4:D5:18:40:30',
                      parentKey: [
                        'Alphanet-BDC',
                        'children',
                        'AlphaNet_5_1',
                        'children',
                        'default',
                        'children'
                      ]
                    }
                  ]
                ]
              }
            ]
          },
          {
            name: 'Default Zone',
            type: 'zone',
            parentKey: [
              'Alphanet-BDC',
              'children'
            ],
            children: [
              {
                name: 'default',
                type: 'apGroup',
                parentKey: [
                  'Alphanet-BDC',
                  'children',
                  'Default Zone',
                  'children'
                ],
                children: [
                  [
                    {
                      name: 'W-04',
                      type: 'ap',
                      mac: '0C:F4:D5:13:3A:F0',
                      parentKey: [
                        'Alphanet-BDC',
                        'children',
                        'Default Zone',
                        'children',
                        'default',
                        'children'
                      ]
                    }
                  ]
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'BDC-Mini-Density',
        type: 'system',
        children: [
          {
            name: 'BDC Domain',
            type: 'domain',
            parentKey: [
              'BDC-Mini-Density',
              'children'
            ],
            children: [
              {
                name: 'Solution LAB',
                type: 'zone',
                parentKey: [
                  'BDC-Mini-Density',
                  'children',
                  'BDC Domain',
                  'children'
                ],
                children: [
                  {
                    name: 'default',
                    type: 'apGroup',
                    parentKey: [
                      'BDC-Mini-Density',
                      'children',
                      'BDC Domain',
                      'children',
                      'Solution LAB',
                      'children'
                    ],
                    children: [
                      [
                        {
                          name: 'R550-Solution-2',
                          type: 'ap',
                          mac: '00:E6:3A:1E:5C:60',
                          parentKey: [
                            'BDC-Mini-Density',
                            'children',
                            'BDC Domain',
                            'children',
                            'Solution LAB',
                            'children',
                            'default',
                            'children'
                          ]
                        },
                        {
                          name: 'R750-Solution-1',
                          type: 'ap',
                          mac: '28:B3:71:2B:D8:30',
                          parentKey: [
                            'BDC-Mini-Density',
                            'children',
                            'BDC Domain',
                            'children',
                            'Solution LAB',
                            'children',
                            'default',
                            'children'
                          ]
                        }
                      ]
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    switchHierarchy: [
      {
        name: 'Alphanet-BDC',
        type: 'system',
        children: [
          {
            name: 'Default Group',
            type: 'switchGroup',
            parentKey: [
              'Alphanet-BDC',
              'children'
            ],
            children: [
              [
                {
                  name: 'ICX8200-C08ZP Router',
                  type: 'switch',
                  mac: '94:B3:4F:2F:7D:0A',
                  parentKey: [
                    'Alphanet-BDC',
                    'children',
                    'Default Group',
                    'children'
                  ]
                },
                {
                  name: 'ICX8200-48ZP2 Router',
                  type: 'switch',
                  mac: '94:B3:4F:2F:C6:4E',
                  parentKey: [
                    'Alphanet-BDC',
                    'children',
                    'Default Group',
                    'children'
                  ]
                }
              ]
            ]
          },
          {
            name: 'EASTBLOCK',
            type: 'switchGroup',
            parentKey: [
              'Alphanet-BDC',
              'children'
            ],
            children: [
              [
                {
                  name: 'ICX7450-32ZP Router',
                  type: 'switch',
                  mac: '60:9C:9F:1D:D3:30',
                  parentKey: [
                    'Alphanet-BDC',
                    'children',
                    'EASTBLOCK',
                    'children'
                  ]
                }
              ]
            ]
          },
          {
            name: 'WESTBLOCK',
            type: 'switchGroup',
            parentKey: [
              'Alphanet-BDC',
              'children'
            ],
            children: [
              [
                {
                  name: 'ICX7150-C12 Router',
                  type: 'switch',
                  mac: '58:FB:96:0B:12:CA',
                  parentKey: [
                    'Alphanet-BDC',
                    'children',
                    'WESTBLOCK',
                    'children'
                  ]
                }
              ]
            ]
          }
        ]
      },
      {
        name: 'ICXM-Scale',
        type: 'system',
        children: [
          {
            name: 'SQA Sunnyvale',
            type: 'domain',
            parentKey: [
              'ICXM-Scale',
              'children'
            ],
            children: [
              {
                name: 'MDU Chamber',
                type: 'switchGroup',
                parentKey: [
                  'ICXM-Scale',
                  'children',
                  'SQA Sunnyvale',
                  'children'
                ],
                children: [
                  [
                    {
                      name: 'Access-Wired',
                      type: 'switch',
                      mac: '78:A6:E1:1C:83:24',
                      parentKey: [
                        'ICXM-Scale',
                        'children',
                        'SQA Sunnyvale',
                        'children',
                        'MDU Chamber',
                        'children'
                      ]
                    }
                  ]
                ]
              },
              {
                name: 'Managed Switches',
                type: 'switchGroup',
                parentKey: [
                  'ICXM-Scale',
                  'children',
                  'SQA Sunnyvale',
                  'children'
                ],
                children: [
                  [
                    {
                      name: 'NET35XX-CORE',
                      type: 'switch',
                      mac: '60:9C:9F:22:E8:80',
                      parentKey: [
                        'ICXM-Scale',
                        'children',
                        'SQA Sunnyvale',
                        'children',
                        'Managed Switches',
                        'children'
                      ]
                    }
                  ]
                ]
              },
              {
                name: 'NET37XX',
                type: 'switchGroup',
                parentKey: [
                  'ICXM-Scale',
                  'children',
                  'SQA Sunnyvale',
                  'children'
                ],
                children: [
                  [
                    {
                      name: 'NET37XX-CORE',
                      type: 'switch',
                      mac: '8C:7A:15:3C:DC:28',
                      parentKey: [
                        'ICXM-Scale',
                        'children',
                        'SQA Sunnyvale',
                        'children',
                        'NET37XX',
                        'children'
                      ]
                    }
                  ]
                ]
              },
              {
                name: 'OLT-Commscope',
                type: 'switchGroup',
                parentKey: [
                  'ICXM-Scale',
                  'children',
                  'SQA Sunnyvale',
                  'children'
                ],
                children: [
                  [
                    {
                      name: 'OLT-Access-ONU1',
                      type: 'switch',
                      mac: '60:9C:9F:FE:5B:78',
                      parentKey: [
                        'ICXM-Scale',
                        'children',
                        'SQA Sunnyvale',
                        'children',
                        'OLT-Commscope',
                        'children'
                      ]
                    },
                    {
                      name: 'OLT-7550-Distribution',
                      type: 'switch',
                      mac: '8C:7A:15:3C:CA:1C',
                      parentKey: [
                        'ICXM-Scale',
                        'children',
                        'SQA Sunnyvale',
                        'children',
                        'OLT-Commscope',
                        'children'
                      ]
                    }
                  ]
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'density-vsze-cluster',
        type: 'system',
        children: [
          {
            name: 'Density',
            type: 'switchGroup',
            parentKey: [
              'density-vsze-cluster',
              'children'
            ],
            children: [
              [
                {
                  name: 'west-density-7650-stack',
                  type: 'switch',
                  mac: '60:9C:9F:52:C9:86',
                  parentKey: [
                    'density-vsze-cluster',
                    'children',
                    'Density',
                    'children'
                  ]
                },
                {
                  name: 'east-icxstack-density',
                  type: 'switch',
                  mac: '60:9C:9F:FE:56:42',
                  parentKey: [
                    'density-vsze-cluster',
                    'children',
                    'Density',
                    'children'
                  ]
                },
                {
                  name: 'density-main-switch',
                  type: 'switch',
                  mac: '60:9C:9F:FE:64:14',
                  parentKey: [
                    'density-vsze-cluster',
                    'children',
                    'Density',
                    'children'
                  ]
                }
              ]
            ]
          }
        ]
      }
    ]
  }
}