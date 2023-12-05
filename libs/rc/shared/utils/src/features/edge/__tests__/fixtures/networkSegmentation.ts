export const mockNsgStatsList = {
  fields: [
    'venueInfos',
    'edgeInfos',
    'networkIds',
    'name',
    'id',
    'tags',
    'edgeAlarmSummary'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '1',
      name: 'nsg1',
      vxlanTunnelProfileId: 'test123',
      networkIds: [
        'wlan-1',
        'wlan2'
      ],
      venueInfos: [
        {
          id: '7a5474bf-be4a-4207-b808-e3aaa8be7a3e',
          venueId: 'mock_venue_1',
          venueName: 'MockVenue1',
          personaGroupId: 'per-444'
        }
      ],
      edgeInfos: [
        {
          id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
          edgeId: '0000000001',
          edgeName: 'Edge1',
          segments: 10,
          devices: 10,
          dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
          dhcpPoolId: '6a408e31-30a0-4ac1-a672-76b666f57d6e',
          vniRange: ''
        }
      ],
      edgeAlarmSummary: [
        {
          edgeId: '0000000001',
          severitySummary: {
            critical: 1
          },
          totalCount: 1
        }
      ]
    },
    {
      id: '2',
      name: 'nsg2',
      vxlanTunnelProfileId: 'test123',
      networkIds: [
        'wlan-1',
        'wlan2'
      ],
      venueInfos: [
        {
          id: '7a5474bf-be4a-4207-b808-e3aaa8be7a3e',
          venueId: 'mock_venue_2',
          venueName: 'MockVenue2',
          personaGroupId: 'per-444'
        }
      ],
      edgeInfos: [
        {
          id: '5e5a85d5-1540-4aab-86c4-a8d8b9f3e28b',
          edgeId: '0000000002',
          edgeName: 'Edge2',
          segments: 10,
          devices: 10,
          dhcpInfoId: 'ee61bd6e-c637-4177-b070-0ded060af3bd',
          dhcpPoolId: '6a408e31-30a0-4ac1-a672-76b666f57d6e',
          vniRange: ''
        }
      ]
    }
  ]
}
