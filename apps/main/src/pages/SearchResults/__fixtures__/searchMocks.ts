export const venueListData = {
  totalCount: 1,
  data: [
    {
      id: 'e0788dea6307472d98795300fcda1119',
      name: 'bdcPerformanceVenue2',
      city: 'Sunnyvale, California',
      country: 'United States',
      latitude: '37.4112751',
      longitude: '-122.0191908',
      networks: {
        count: 3,
        names: [
          '!!!AAA_dpsk_performance_test!!!',
          '!!bdc_tenant_test!!',
          '!!.1xPerformance!!'
        ],
        vlans: [
          1
        ]
      },
      aggregatedApStatus: {
        '3_04_DisconnectedFromCloud': 78,
        '3_02_FirmwareUpdateFailed': 329,
        '1_01_NeverContactedCloud': 91,
        '1_07_Initializing': 2
      },
      status: '3_RequiresAttention'
    }
  ]
}

export const networkListData = {
  totalCount: 3,
  data: [
    {
      name: '!!!!!_Cap_',
      id: 'e796c63f5db646e181f9e5aa8a75e3c1',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'ClickThrough',
      ssid: '!!!!!_Cap_',
      venues: {
        count: 0,
        names: [

        ]
      },
      aps: 0,
      clients: 0
    },
    {
      name: 'Joseph_captive',
      id: '349f5794ff5c4d8fa480a7860c12d098',
      vlan: 1,
      nwSubType: 'guest',
      captiveType: 'GuestPass',
      ssid: 'Joseph_captive',
      venues: {
        count: 0,
        names: [

        ]
      },
      aps: 0,
      clients: 0
    }
  ]
}