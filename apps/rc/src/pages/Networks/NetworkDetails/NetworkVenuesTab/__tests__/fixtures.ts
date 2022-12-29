/* eslint-disable max-len */

import {
  NetworkTypeEnum,
  RadioTypeEnum,
  RadioEnum,
  WlanSecurityEnum,
  SchedulerTypeEnum
} from '@acx-ui/rc/utils'

export const network = {
  type: NetworkTypeEnum.AAA,
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  venues: [
    {
      venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
      dual5gEnabled: true,
      tripleBandEnabled: false,
      networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
      allApGroupsRadio: RadioEnum.Both,
      isAllApGroups: true,
      allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      id: '7a97953dc55f4645b3cdbf1527f3d7cb'
    }
  ],
  wlan: {
    enabled: true,
    ssid: '03',
    vlanId: 1
  },
  name: '03',
  enableAuthProxy: false,
  enableAccountingProxy: false,
  id: '373377b0cb6e46ea8982b1c80aabe1fa'
}

export const user = { COMMON: '{"supportTriRadio":true,"tab-venue-clients":"wifi"}' }

export const list = {
  totalCount: 2,
  page: 1,
  data: [
    {
      id: 'd7b1a9a350634115a92ee7b0f11c7e75',
      name: 'network-venue-1',
      description: '',
      city: 'Melbourne, Victoria',
      country: 'Australia',
      latitude: '-37.8145092',
      longitude: '144.9704868',
      networks: { count: 1, names: ['03'], vlans: [1] },
      aggregatedApStatus: { '1_01_NeverContactedCloud': 1 },
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      allApDisabled: false
    },
    {
      id: '02e2ddbc88e1428987666d31edbc3d9a',
      name: 'My-Venue',
      description: 'My-Venue',
      city: 'New York',
      country: 'United States',
      latitude: '40.7691341',
      longitude: '-73.94297689999999',
      switchClients: 2,
      switches: 1,
      status: '1_InSetupPhase',
      mesh: { enabled: false },
      wlan: { wlanSecurity: WlanSecurityEnum.WPA3 }
    }
  ]
}

export const networkVenue_allAps = {
  venueId: 'd7b1a9a350634115a92ee7b0f11c7e75',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: true,
  allApGroupsRadioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  id: '7a97953dc55f4645b3cdbf1527f3d7cb'
}

export const networkVenue_apgroup = {
  venueId: '02e2ddbc88e1428987666d31edbc3d9a',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: false,
  id: '7a97953dc55f4645b3cdbf1527f3d7cb',
  scheduler: {
    type: SchedulerTypeEnum.ALWAYS_ON
  },
  apGroups: [{
    radio: RadioEnum._2_4_GHz,
    radioTypes: [RadioTypeEnum._2_4_GHz],
    isDefault: true,
    apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
    apGroupName: 'APs not assigned to any group',
    vlanPoolId: '1c061cf2649344adaf1e79a9d624a451',
    vlanPoolName: 'pool1'
  }]
}

export const vlanPoolList = [{
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  name: 'pool1',
  vlanMembers: ['123'],
  id: '1c061cf2649344adaf1e79a9d624a451'
}]

export const timezoneRes = { // location=-37.8145092,144.9704868
  dstOffset: 0,
  rawOffset: 36000,
  status: 'OK',
  timeZoneId: 'Australia/Melbourne',
  timeZoneName: 'Australian Eastern Standard Time'
}


export const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
}


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