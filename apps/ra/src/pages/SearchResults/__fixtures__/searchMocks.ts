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

export const eventListData = {
  data: [
    {
      severity: 'Info',
      adminName: 'FisrtName 12 LastName 12',
      product: 'WIFI',
      entity_type: 'ADMINACTIVITY',
      event_datetime: '2022-11-30T09:51:26Z',
      name: 'AdminActivity',
      id: '1f6a9c969c734f7abea7af3fe634c224',
      entity_id: '18036ce747664d97a73dc278e8c9ff46',
      // eslint-disable-next-line max-len
      message: '{ "message_template": "Network %%networkName was added by %%adminName (%%adminEmail).", "data": {"adminName":{"entityType":"NETWORK"},"networkName":{"entityType":"NETWORK"},"adminEmail":{"entityType":"NETWORK"}} }',
      ssid: 'mike test 1',
      adminEmail: 'dog12@email.com'
    }
  ],
  subsequentQueries: [
    {
      fields: [
        'apName',
        'switchName',
        'networkName',
        'networkId',
        'administratorEmail',
        'venueName',
        'apGroupId',
        'apGroupName',
        'floorPlanName',
        'recipientName'
      ],
      url: '/api/eventalarmapi/662b4f2c76a0428a9e7faaa64534d67a/event/meta'
    }
  ],
  totalCount: 1,
  fields: [
    'event_datetime',
    'severity',
    'entity_type',
    'product',
    'entity_id',
    'macAddress',
    'message',
    'dpName',
    'apMac',
    'clientMac',
    'serialNumber',
    'ssid',
    'radio',
    'raw_event',
    'sourceType',
    'adminName',
    'clientName',
    'userName',
    'hostname',
    'adminEmail',
    'venueId',
    'transactionId',
    'name'
  ]
}

export const eventMetaData = {
  data: [
    {
      networkName: 'mike test 1',
      networkId: '18036ce747664d97a73dc278e8c9ff46',
      id: '1f6a9c969c734f7abea7af3fe634c224',
      isApExists: false,
      isNetworkExists: true,
      isSwitchExists: false
    }
  ],
  fields: [
    'apName',
    'switchName',
    'networkName',
    'networkId',
    'administratorEmail',
    'venueName',
    'apGroupId',
    'floorPlanName',
    'recipientName'
  ]
}

export const switchListData = {
  fields: [
    'suspendingDeployTime', 'serialNumber', 'syncedSwitchConfig', 'ipAddress',
    'check-all', 'configReady', 'cliApplied', 'isStack', 'syncDataStartTime',
    'deviceStatus', 'uptime', 'venueName', 'switchMac', 'formStacking', 'switchName',
    'operationalWarning', 'venueId', 'syncDataId', 'name', 'model', 'activeSerial',
    'cog', 'id', 'clientCount'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      id: 'c0:c5:20:aa:24:57',
      model: 'ICX7150-C12P',
      uptime: '20 days, 22 hours',
      switchName: 'ICX7150-C12 Router',
      serialNumber: 'FEK3224R08H',
      activeSerial: 'FEK3224R08H',
      ipAddress: '10.206.10.40',
      deviceStatus: 'ONLINE',
      switchMac: 'c0:c5:20:aa:24:57',
      isStack: false,
      name: 'ICX7150-C12 Router',
      venueId: '977d4caed36b40b5adbed075f2d57a23',
      venueName: 'My-Venue',
      clientCount: 1,
      configReady: true,
      syncedSwitchConfig: true,
      syncDataEndTime: '',
      cliApplied: false,
      formStacking: false,
      suspendingDeployTime: ''
    }
  ]
}