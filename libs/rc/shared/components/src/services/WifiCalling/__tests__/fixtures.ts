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
