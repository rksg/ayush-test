
export const mockFencing = {
  enabled: true,
  services: [
    {
      service: 'AIRDISK',
      customServiceName: '', //(If service is "OTHER")
      wirelessEnabled: true,
      wirelessRule: {
        fencingRange: 'SAME_AP' //ONE_HOP_AP
      },
      wiredEnabled: true,
      wiredRules: [
        {
          name: 'rule1',
          fencingRange: 'SAME_AP', //ONE_HOP_AP
          closestApMac: '18:7C:0B:10:29:50',
          deviceMacAddresses: [
            '11:22:AA:BB:55:66',
            '11:22:AA:BB:55:77'
          ]
        },
        {
          name: 'rule2',
          fencingRange: 'SAME_AP', //ONE_HOP_AP
          closestApMac: '18:7C:0B:10:29:51',
          deviceMacAddresses: [
            '11:22:AA:BB:55:EE',
            '11:22:AA:BB:55:FF',
            '55:55:55:55:55:55'
          ]
        }
      ],
      description: 'Fencing rule description',
      customMappingEnabled: true,
      customStrings: [
        '_cafe._tcp.',
        '_cafe._udp.'
      ]
    },{
      service: 'AIRPLAY',
      customServiceName: '', //(If service is "OTHER")
      wirelessEnabled: true,
      wirelessRule: {
        fencingRange: 'ONE_HOP_AP'
      },
      wiredEnabled: false,
      description: 'Fencing rule description',
      customMappingEnabled: false
    },{
      service: 'OTHER',
      customServiceName: 'myCustomService', //(If service is "OTHER")
      wirelessEnabled: false,
      wiredEnabled: false,
      description: 'Fencing rule description',
      customMappingEnabled: false
    },{
      service: 'OTHER',
      customServiceName: 'test2', //(If service is "OTHER")
      wirelessEnabled: false,
      wiredEnabled: false,
      description: '',
      customMappingEnabled: false
    },{
      service: 'OTHER',
      customServiceName: 'test3', //(If service is "OTHER")
      wirelessEnabled: false,
      wiredEnabled: false,
      description: '',
      customMappingEnabled: false
    }
  ]
}

export const mockApList = {
  totalCount: 2,
  page: 1,
  data: [
    {
      name: 'mock-ap',
      apMac: '18:7C:0B:10:29:50',
      serialNumber: '125488555569',
      venueId: '52001e212a02484e815a8cadf0024f2b'
    },
    {
      name: 'mock-ap2',
      apMac: '18:7C:0B:10:29:51',
      serialNumber: '150000000761',
      venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b'
    }
  ]
}
