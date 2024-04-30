export const mockNetworkResult = {
  fields: [
    'clients',
    'aps',
    'description',
    'check-all',
    'ssid',
    'captiveType',
    'vlan',
    'name',
    'venues',
    'cog',
    'vlanPool',
    'id',
    'nwSubType'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      name: 'Open-Network',
      id: '28ebc4915a94407faf8885bcd1fe7f0b',
      vlan: 1,
      nwSubType: 'open',
      ssid: 'Open-Network',
      venues: {
        count: 0,
        names: [],
        ids: []
      },
      aps: 0,
      clients: 0
    }
  ]
}

export const mockWifiCallingTableResult = {
  fields: ['ePDGs', 'epdg', 'qosPriority', 'networkIds', 'epdgs', 'name', 'tenantId', 'id'],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'b6ebccae545c44c1935ddaf746f5b048',
      name: 'wifi-1',
      qosPriority: 'WIFICALLING_PRI_VOICE',
      networkIds: [],
      tenantId: '1977de24c7824b0b975c4d02806e081f',
      epdgs: [
        {
          domain: 'a.b.comd'
        }
      ]
    }
  ]
}

export const mockWifiCallingDetail = {
  networkIds: [
    '44c5604da90443968e1ee91706244e63',
    'c8cd8bbcb8cc42caa33c991437ecb983',
    '5cae9e28662447008ea86ec7c339661b'
  ],
  description: 'for test',
  qosPriority: 'WIFICALLING_PRI_VOICE',
  serviceName: 'wifiCSP1',
  id: 'wifiCallingServiceId1',
  epdgs: [
    {
      ip: '1.2.3.4',
      domain: 'abc.com'
    },
    {
      domain: 'def.com'
    }
  ]
}


export const mockWifiCallingNetworksDetail = {
  fields: [
    'clients',
    'aps',
    'description',
    'check-all',
    'ssid',
    'captiveType',
    'vlan',
    'name',
    'venues',
    'cog',
    'vlanPool',
    'id',
    'nwSubType'
  ],
  totalCount: 3,
  page: 1,
  data: [
    {
      name: 'wlan1',
      id: '44c5604da90443968e1ee91706244e63',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'wlan1'
        ]
      }
    },
    {
      name: 'wlan2',
      id: 'c8cd8bbcb8cc42caa33c991437ecb983',
      nwSubType: 'open',
      venues: {
        count: 1,
        names: [
          'wlan2'
        ]
      }
    },
    {
      name: 'wlan3',
      id: '5cae9e28662447008ea86ec7c339661b',
      nwSubType: 'psk',
      venues: {
        count: 1,
        names: [
          'wlan3'
        ]
      }
    }
  ]
}

export const wifiCallingSettingTable = [
  {
    profileName: 'AT&T',
    description: 'AT&T des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  },
  {
    profileName: 'Sprint',
    description: 'Sprint des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  },
  {
    profileName: 'Verizon',
    description: 'Verizon des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  },
  {
    profileName: 'T-Mobile',
    description: 'T-Mobile des',
    qosPriority: 'WIFICALLING_PRI_VOICE'
  }
]
