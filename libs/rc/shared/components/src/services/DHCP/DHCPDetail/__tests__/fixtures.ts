export const list = {
  fields: ['name', 'switches', 'id', 'aggregatedApStatus'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'e16f5cb9aded49f6acd5891eb8897890', name: 'dfggsrgesr' },
    { id: '57db532207814948aa61b156e1cf2b9e', name: 'RT Nagar' },
    { id: '2725fdb455ec4785b1a633039b70b1aa', name: 'test_UK',
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 } }]
}

export const detailResult = {
  usage: [
    {
      venueId: 'e16f5cb9aded49f6acd5891eb8897890',
      totalIpCount: 24,
      usedIpCount: 3
    }],
  dhcpMode: 'EnableOnMultipleAPs',
  dhcpPools: [
    {
      name: 'DhcpServiceProfile#1',
      vlanId: 1001,
      subnetAddress: '192.168.1.0',
      subnetMask: '255.255.255.0',
      startIpAddress: '192.168.1.1',
      endIpAddress: '192.168.1.254',
      leaseTimeHours: 0,
      leaseTimeMinutes: 30,
      id: '14eb1818309c434da928410fa2298ea5',
      description: 'description1'
    }
  ],
  serviceName: 'DhcpConfigServiceProfile1',
  id: '78f92fbf80334e8b83cddd3210db4920'
}

export const queryConfigTemplate = {
  fields: null,
  totalCount: 1,
  page: 1,
  data: [
    {
      id: '931c333abb84474aba1e24f72f391ba9',
      name: 'dhcpConfigTemplate1',
      dhcpPools: [
        {
          name: 'pool1',
          startAddress: '1.1.1.1',
          endAddress: '1.1.1.100',
          networkAddress: '1.1.1.0'
        },
        {
          name: 'pool2',
          startAddress: '2.2.2.1',
          endAddress: '2.2.2.100',
          networkAddress: '2.2.2.0'
        }
      ],
      venueIds: [
        'f6b580778ca54db78611ba4dcf2e29ba'
      ]
    }
  ]
}

export const getConfigTemplateDhcpProfileDetail = {
  dhcpPools: [
    {
      startIpAddress: '1.1.1.1',
      endIpAddress: '1.1.1.100',
      name: 'pool1',
      vlanId: 301,
      subnetAddress: '1.1.1.0',
      subnetMask: '255.255.255.0',
      leaseTimeHours: 24,
      leaseTimeMinutes: 0
    },
    {
      startIpAddress: '2.2.2.1',
      endIpAddress: '2.2.2.100',
      name: 'pool2',
      vlanId: 302,
      subnetAddress: '2.2.2.0',
      subnetMask: '255.255.255.0',
      leaseTimeHours: 24,
      leaseTimeMinutes: 0
    }
  ],
  dhcpMode: 'EnableOnEachAPs',
  serviceName: 'dhcpConfigTemplate1',
  id: '931c333abb84474aba1e24f72f391ba9'
}

export const configTemplateWifiDhcpPoolUsages = { name: 'pool1' }

export const mockVenueData = {
  fields: [
    'name',
    'switches',
    'id',
    'aggregatedApStatus'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'f6b580778ca54db78611ba4dcf2e29ba',
      name: 'testVenue'
    }
  ]
}
