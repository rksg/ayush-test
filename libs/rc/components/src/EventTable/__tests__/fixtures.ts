import { DetailLevel, UserProfile } from '@acx-ui/user'

/* eslint-disable max-len */
export const events = [{
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
}, {
  severity: 'Major',
  product: 'WIFI',
  serialNumber: '982072000834',
  apMac: 'c8:03:f5:2c:83:a0',
  entity_id: '982072000834',
  message: '{ "message_template": "AP %%apName is unable to reach radius server 123.10.10.45.", "data" : { "apName" : { "entityId" : "serialNumber", "entityType" : "AP" } } }',
  raw_event: '{"eventId":"2102","apMac":"c8:03:f5:2c:83:a0","ip":"123.10.10.45","apName":"850-151-164","fwVersion":"6.2.0.103.513","model":"R850","zoneUUID":"555548721e264115bda45a75043f65d7","zoneName":"555548721e264115bda45a75043f65d7","timeZone":"PST+8PDTM3.2.0/02:00M11.1.0/02:00","apLocation":","apGps":"37.411275-122.019191","apIpAddress":"192.168.151.164","apIpv6Address":","apGroupUUID":"2ea819d65d7a4e4fa29a04a87a5ca06f","domainId":"662b4f2c76a0428a9e7faaa64534d67a","serialNumber":"982072000834","domainName":"Dog Company 12","apDescription":"850-151-164","tenantId":"662b4f2c76a0428a9e7faaa64534d67a","tenantName":"Dog Company 12","venueId":"555548721e264115bda45a75043f65d7","venueName":"BDCSZ","apGroupId":"2ea819d65d7a4e4fa29a04a87a5ca06f","apGroupName":"Default","apId":"C8:03:F5:2C:83:A0","poePort":"1"}',
  macAddress: 'c8:03:f5:2c:83:a0',
  entity_type: 'NETWORK',
  event_datetime: '2022-12-26T06:36:03Z',
  venueId: '555548721e264115bda45a75043f65d7',
  name: 'RadiusServerUnreachable',
  id: '2fc002d8fcf04742a7d0aba36e1ebd85'
}, {
  severity: 'Info',
  product: 'WIFI',
  serialNumber: '962202006696',
  clientMac: 'a8:64:f1:1b:35:37',
  clientName: '8483-A14-Dell6E',
  apMac: '94:b3:4f:3c:a2:20',
  entity_id: 'a8:64:f1:1b:35:37',
  message: '{ "message_template": "User @@clientName was disconnected from the Wi-Fi network %%networkName due to lack of activity.", "data" : { "networkName" : { "entityId" : "networkId", "entityType" : "NETWORK" } } }',
  ssid: '123guest',
  radio: 'a/n/ac/ax',
  raw_event: '{"eventId":"205","apMac":"94:b3:4f:3c:a2:20","clientMac":"a8:64:f1:1b:35:37","ssid":"123guest","bssid":"94:b3:4f:bc:a2:25","userId":","wlanId":"78","iface":"wlan37","tenantUUID":"839f87c6-d116-497e-afce-aa8157abd30c","apName":"R750-11-40","apGps":"37.411275-122.019191","wlanIdealEventRequired":","clientIP":"192.168.11.82","clientIPv6":"2001:df3:80d:8400:192::f7","vlanId":"1","radio":"a/n/ac/ax","encryption":"None","osType":"Windows (Laptop/Mobile) 8/8.1/10/11","hostname":"8483-A14-Dell6E","firstAuth":"1672109818","associationTime":"1672109818","ipAssignTime":"1672109873","disconnectTime":"1672110727","sessionDuration":"909","disconnectReason":"4","rxFrames":"5363","rxBytes":"493908","txFrames":"10620","txBytes":"2737912","peakRx":"485026","peakTx":"2237192","rssi":"32","receivedSignalStrength":"-75","Instantaneous rssi":"0","Xput":"0","fwVersion":"6.2.0.103.513","model":"R750","zoneUUID":"555548721e264115bda45a75043f65d7","zoneName":"555548721e264115bda45a75043f65d7","timeZone":"PST+8PDTM3.2.0/02:00M11.1.0/02:00","apLocation":","apIpAddress":"192.168.11.40","apIpv6Address":","apGroupUUID":"2ea819d65d7a4e4fa29a04a87a5ca06f","domainId":"662b4f2c76a0428a9e7faaa64534d67a","serialNumber":"962202006696","domainName":"Dog Company 12","wlanGroupUUID":"2ea819d65d7a4e4fa29a04a87a5ca06f_RADIO24","apDescription":"R750-11-40","tenantId":"662b4f2c76a0428a9e7faaa64534d67a","tenantName":"Dog Company 12","venueId":"555548721e264115bda45a75043f65d7","venueName":"BDCSZ","apGroupId":"2ea819d65d7a4e4fa29a04a87a5ca06f","apGroupName":"Default","apId":"94:B3:4F:3C:A2:20","poePort":"1"}',
  hostname: '8483-A14-Dell6E',
  macAddress: 'a8:64:f1:1b:35:37',
  entity_type: 'CLIENT',
  event_datetime: '2022-12-27T03:12:10Z',
  venueId: '555548721e264115bda45a75043f65d7',
  name: 'UserDisconnectedIdleTO',
  id: '4b0d005f2f8e416d8beb9972651a3750'
}, {
  severity: 'Info',
  raw_event: '{"eventId":"22071","tenantId":"fe892a451d7a486bbb3aee929d2dfcd1","zoneName":"5c05180d54d84e609a4d653a3a8332d1","switchSerialNumber":"FEK3204N013","switchMacAddress":"FEK3204N013","switchName":"Switch-03"}',
  product: 'SWITCH',
  macAddress: 'FEK3204N013',
  serialNumber: 'FEK3204N013',
  entity_type: 'SWITCH',
  event_datetime: '2022-12-23T03:24:06Z',
  venueId: '5c05180d54d84e609a4d653a3a8332d1',
  name: 'SwitchDeletedByCloud',
  id: '3082c3547b674eb0b481842595090110',
  entity_id: 'FEK3204N013',
  message: '{ "message_template": "@@switchName Switch is deleted by the cloud controller." }'
}]

export const eventsMeta = [{
  venueName: 'Stable-client',
  switchName: '112002012932',
  id: 'b5f7d6e63d584971819cf6cbb004f03b',
  isApExists: true,
  isVenueExists: true,
  apGroupId: '7408fe2897354974a0bfdfb182f79c03',
  isSwitchExists: false,
  apName: '730-11-60'
}, {
  venueName: 'BDCSZ',
  switchName: '982072000834',
  id: '2fc002d8fcf04742a7d0aba36e1ebd85',
  isApExists: true,
  isVenueExists: true,
  apGroupId: '2ea819d65d7a4e4fa29a04a87a5ca06f',
  isSwitchExists: false,
  apName: '850-151-164'
}, {
  venueName: 'BDCSZ',
  switchName: '962202006696',
  networkName: '123guest',
  networkId: 'f12fd4b775954d46a478b22457bccdcf',
  isClientExists: true,
  id: '4b0d005f2f8e416d8beb9972651a3750',
  isApExists: true,
  isVenueExists: true,
  apGroupId: '2ea819d65d7a4e4fa29a04a87a5ca06f',
  isNetworkExists: true,
  isSwitchExists: false,
  apName: 'R750-11-40'
}, {
  venueName: 'My-Venue',
  switchName: 'FEK3204N013',
  id: '3082c3547b674eb0b481842595090110',
  isApExists: false,
  isVenueExists: true,
  isSwitchExists: true
}]

export const eventsForQuery = {
  data: events,
  totalCount: events.length,
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

export const eventsMetaForQuery = {
  data: eventsMeta,
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

export const fakeUserProfile = {
  region: '[NA]',
  allowedRegions: [
    {
      name: 'US',
      description: 'United States of America',
      link: 'https://devalto.ruckuswireless.com',
      current: true
    }
  ],
  externalId: '0032h00000LUqcoAAD',
  pver: 'acx-hybrid',
  companyName: 'Dog Company 1551',
  firstName: 'FisrtName 1551',
  lastName: 'LastName 1551',
  username: 'dog1551@email.com',
  role: 'PRIME_ADMIN',
  roles: ['PRIME_ADMIN'],
  detailLevel: DetailLevel.DEBUGGING,
  dateFormat: 'mm/dd/yyyy',
  email: 'dog1551@email.com',
  var: false,
  tenantId: '8c36a0a9ab9d4806b060e112205add6f',
  varTenantId: '8c36a0a9ab9d4806b060e112205add6f',
  adminId: '4159559db15c4027903d9c3d4bdb8a7e',
  support: false,
  dogfood: false
} as UserProfile
