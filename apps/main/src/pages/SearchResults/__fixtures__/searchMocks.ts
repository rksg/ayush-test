export const venueListData = [
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


export const networkListData = [
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

export const apListData = {
  fields: [
    'clients','serialNumber','IP','apMac','apStatusData.APRadio.channel','deviceStatus','tags',
    'venueName','meshRole','apStatusData.APRadio.band','apStatusData.APRadio.radioId','switchName',
    'deviceGroupId','venueId','name','deviceGroupName','model','fwVersion'
  ],
  totalCount: 1,
  page: 1,
  data: [{
    serialNumber: '932173000117',
    name: '350-11-69',
    model: 'R350',
    fwVersion: '6.2.0.103.513',
    venueId: '70ffc8b0c3f540049379a84c17e5bab3',
    venueName: '123roam',
    deviceStatus: '2_00_Operational',
    IP: '192.168.11.69',
    apMac: '58:FB:96:01:9A:30',
    apStatusData: {
      APRadio: [
        { txPower: null,channel: 9,band: '2.4G',Rssi: null,radioId: 0 },
        { txPower: null,channel: 40,band: '5G',Rssi: null,radioId: 1 }
      ]
    },
    meshRole: 'DISABLED',
    deviceGroupId: '48392c8c2eda43be90213e8dd09468fe',
    tags: '',
    deviceGroupName: ''
  }]
}