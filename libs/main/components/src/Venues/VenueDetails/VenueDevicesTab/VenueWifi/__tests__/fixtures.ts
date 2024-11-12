
export const meshApsQuery = {
  fields: [
    'meshRole',
    'macAddress',
    'serialNumber',
    'healthStatus',
    'networkStatus',
    'venueId',
    'name',
    'meshStatus',
    'model',
    'clientCount'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      root: {
        serialNumber: '302002028855',
        name: 'ap1',
        venueId: '4b6dc218411d4b8cade17d16a034bcbb',
        model: 'R550',
        macAddress: '34:89:BB:CC:AA:00',
        meshRole: 'RAP',
        networkStatus: {
          ipAddress: '1.2.3.4',
          externalIpAddress: '3.8.8.8',
          ipAddressType: 'dynamic',
          netmask: '255.255.254.0',
          gateway: '10.206.123.254',
          primaryDnsServer: '10.10.10.10',
          secondaryDnsServer: '10.10.10.10',
          managementTrafficVlan: 1
        },
        meshStatus: {
          neighbors: [
            {
              rssi: 73,
              macAddress: '34:20:33:12:33:00'
            }
          ],
          hopCount: 0,
          downlinks: [
            {
              macAddress: '34:20:33:CC:33:00',
              rssi: 64
            }
          ],
          radios: [
            {
              channel: 149,
              band: '5 GHz'
            }
          ]
        },
        healthStatus: 'EXCELLENT'
      },
      members: [
        {
          serialNumber: '302002028687',
          name: 'ap2',
          venueId: '4b6dc218411d4b8cade17d16a034bcbb',
          model: 'R550',
          macAddress: '34:20:EE:11:AA:66',
          meshRole: 'MAP',
          networkStatus: {
            ipAddress: '10.1.2.2',
            externalIpAddress: '20.8.9.254',
            ipAddressType: 'dynamic',
            netmask: '255.255.254.0',
            gateway: '10.6.1.254',
            primaryDnsServer: '10.10.10.10',
            secondaryDnsServer: '10.10.10.10',
            managementTrafficVlan: 1
          },
          meshStatus: {
            neighbors: [
              {
                rssi: 75,
                macAddress: '34:20:33:11:DD:00'
              }
            ],
            hopCount: 1,
            uplinks: [
              {
                macAddress: '34:20:BB:CC:DD:00',
                rssi: 75
              }
            ],
            radios: [
              {
                channel: 149,
                band: '5 GHz'
              }
            ]
          },
          healthStatus: 'EXCELLENT'
        }
      ]
    }
  ]
}