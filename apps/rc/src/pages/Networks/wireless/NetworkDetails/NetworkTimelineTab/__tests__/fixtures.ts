/* eslint-disable max-len */
export const events = {
  data: [
    {
      severity: 'Info',
      product: 'WIFI',
      serialNumber: '112002012932',
      apMac: '70:CA:97:0B:67:70',
      entity_id: '112002012932',
      message: '{ "message_template": "AP @@apName RF operating channel was changed from channel 7 to channel 9." }',
      radio: 'b/g/n/ax',
      raw_event: '{"eventId":"306","apMac":"70:CA:97:0B:67:70","radio":"b/g/n/ax","fromChannel":"7","toChannel":"9","apName":"730-11-60","fwVersion":"6.2.0.103.500","model":"R730","zoneUUID":"745640c2f2984410a800d92350d21c3c","zoneName":"745640c2f2984410a800d92350d21c3c","timeZone":"PST+8PDTM3.2.0/02:00M11.1.0/02:00","apLocation":"","apGps":"37.411275-122.019191","apIpAddress":"192.168.11.60","apIpv6Address":"","apGroupUUID":"7408fe2897354974a0bfdfb182f79c03","domainId":"662b4f2c76a0428a9e7faaa64534d67a","serialNumber":"112002012932","domainName":"Dog Company 12","apDescription":"730-11-60","tenantId":"662b4f2c76a0428a9e7faaa64534d67a","tenantName":"Dog Company 12","venueId":"745640c2f2984410a800d92350d21c3c","venueName":"Stable-client","apGroupId":"7408fe2897354974a0bfdfb182f79c03","apGroupName":"Default","apId":"70:CA:97:0B:67:70","poePort":"1"}',
      macAddress: '70:CA:97:0B:67:70',
      entity_type: 'AP',
      event_datetime: '2022-12-08T11:59:09Z',
      venueId: '745640c2f2984410a800d92350d21c3c',
      name: 'ApRFChannelChanged',
      id: 'b5f7d6e63d584971819cf6cbb004f03b'
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
    'message',
    'dpName',
    'apMac',
    'clientMac',
    'macAddress',
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

export const eventsMeta = {
  data: [
    {
      venueName: 'Stable-client',
      switchName: '112002012932',
      id: 'b5f7d6e63d584971819cf6cbb004f03b',
      isApExists: true,
      isVenueExists: true,
      apGroupId: '7408fe2897354974a0bfdfb182f79c03',
      isSwitchExists: false,
      apName: '730-11-60'
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

export const activities = {
  fields: [
    'startDatetime',
    'endDatetime',
    'status',
    'product',
    'admin',
    'descriptionTemplate',
    'descriptionData',
    'severity'
  ],
  totalCount: 1,
  page: 1,
  data: [
    {
      tenantId: '662b4f2c76a0428a9e7faaa64534d67a',
      requestId: 'c943892b-41f4-4d9f-822b-c6ed94cf3ba5',
      status: 'SUCCESS',
      useCase: 'UpdateNetworkDeep',
      notification: {
        enabled: false,
        type: 'email'
      },
      admin: {
        name: 'FisrtName 12 LastName 12',
        email: 'dog12@email.com',
        ip: '',
        id: '',
        interface: ''
      },
      steps: [
        {
          id: 'UpdateNetworkDeep',
          description: 'UpdateNetworkDeep',
          status: 'SUCCESS',
          progressType: 'REQUEST',
          startDatetime: '2022-12-07T11:21:21Z',
          endDatetime: '2022-12-07T11:21:24Z'
        }
      ],
      product: 'WIFI',
      startDatetime: '2022-12-07T11:21:21Z',
      endDatetime: '2022-12-07T11:21:24Z',
      descriptionTemplate: 'Network \'@@networkName\' was updated',
      descriptionData: [
        {
          name: 'count',
          value: '1'
        },
        {
          name: 'networkName',
          value: '123roam'
        },
        {
          name: 'networkName',
          value: '123roam'
        },
        {
          name: 'admin-name',
          value: 'FisrtName 12 LastName 12'
        },
        {
          name: 'ssid',
          value: '123roam'
        }
      ],
      severity: 'Info'
    },
    // case for no descriptionData
    {
      tenantId: '662b4f2c76a0428a9e7faaa64534d67a',
      requestId: 'c943892b-41f4-4d9f-822b-c6ed94cf3ba5',
      status: 'SUCCESS',
      useCase: 'UpdateNetworkDeep',
      notification: {
        enabled: false,
        type: 'email'
      },
      admin: {
        name: 'FisrtName 12 LastName 12',
        email: 'dog12@email.com',
        ip: '',
        id: '',
        interface: ''
      },
      steps: [
        {
          id: 'UpdateNetworkDeep',
          description: 'UpdateNetworkDeep',
          status: 'SUCCESS',
          progressType: 'REQUEST',
          startDatetime: '2022-12-07T11:21:22Z',
          endDatetime: '2022-12-07T11:21:24Z'
        }
      ],
      product: 'WIFI',
      startDatetime: '2022-12-07T11:21:22Z',
      endDatetime: '2022-12-07T11:21:24Z',
      descriptionTemplate: 'Network \'@@networkName\' was updated',
      severity: 'Info'
    },
    // case for value is missing in descriptionData
    {
      tenantId: '662b4f2c76a0428a9e7faaa64534d67a',
      requestId: 'c943892b-41f4-4d9f-822b-c6ed94cf3ba5',
      status: 'SUCCESS',
      useCase: 'UpdateNetworkDeep',
      notification: {
        enabled: false,
        type: 'email'
      },
      admin: {
        name: 'FisrtName 12 LastName 12',
        email: 'dog12@email.com',
        ip: '',
        id: '',
        interface: ''
      },
      steps: [
        {
          id: 'UpdateNetworkDeep',
          description: 'UpdateNetworkDeep',
          status: 'SUCCESS',
          progressType: 'REQUEST',
          startDatetime: '2022-12-07T11:21:23Z',
          endDatetime: '2022-12-07T11:21:24Z'
        }
      ],
      product: 'WIFI',
      startDatetime: '2022-12-07T11:21:23Z',
      endDatetime: '2022-12-07T11:21:24Z',
      descriptionTemplate: 'Network \'@@missingValue\' was updated',
      descriptionData: [
        {
          name: 'count',
          value: '1'
        },
        {
          name: 'networkName',
          value: '123roam'
        },
        {
          name: 'admin-name',
          value: 'FisrtName 12 LastName 12'
        },
        {
          name: 'ssid',
          value: '123roam'
        }
      ],
      severity: 'Info'
    }
  ]
}
