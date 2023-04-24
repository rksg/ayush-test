/* eslint-disable max-len */
export const events = [{
  severity: 'Info',
  product: 'WIFI',
  serialNumber: '112002012932',
  apMac: '70:CA:97:0B:67:70',
  entity_id: '112002012932',
  message: '{ "message_template": "AP @@apName RF operating channel was changed from channel 7 to channel 9." }',
  detailedDescription: '{ "message_template": "AP [ @@apName @0C:F4:D5:18:03:A0] updated its firmware from [118.1.0.0.16806772] to [6.2.1.103.1654] and DownloadSpeed=[0.00]." }',
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
}].map(event => ({
  ...event,
  tableKey: event.event_datetime + event.id
}))

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
    'name',
    'ipAddress'
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

/* eslint-disable max-len */
export const adminLogs = [{
  severity: 'Info',
  adminName: 'FisrtName 12 LastName 12',
  raw_event: '{"stream":"stdout","docker":{"container_id":"2ed4013eaa21517aa615ccfef560f4979e594537a8fbfacf997e894cd9a95fb2"},"kubernetes":{"container_name":"login","namespace_name":"alto","pod_name":"login-64c79b44cb-sklhr","container_image":"sha256:f85e0516b5c169050b1bdffbcff4cf95d153ec8680c810b1d665d4514487167e","container_image_id":"gcr.io/kumo-scratch/services/login@sha256:22942642e04ac9f2a2aeaae828e14eb4c69f619ba5b89062675f41832bbf618a","pod_id":"2fb67f34-52c5-4051-b67d-8379067fa820","labels":{"app":"login","bom":"acx-service-5409-C","build":"3659","build_commit_sha":"6f5e0a979372d6627fe683b8302f7f194ef672b9","deployedby":"shabarish.vaidyanath","deployeddatetime":"2022-12-06-06-37-18","deployedts":"1670308638","lastdeployed":"0","pod-template-hash":"64c79b44cb","primary_protocol":"http","project":"acx","pver_route":"acx","version":"0.0.1","security_istio_io/tlsMode":"istio","service_istio_io/canonical-name":"login","service_istio_io/canonical-revision":"0.0.1","topology_istio_io/network":"alto-dev-200221-alto-devolve"},"host":"gke-devolve-cluster-core-2-302d2f84-w5ok","master_url":"https://10.137.32.1:443/api","namespace_id":"fe9f5068-055c-40cf-b6dc-6ddadf3866ce","namespace_labels":{"argocd_argoproj_io/instance":"argocd-core","istio_io/rev":"asm-1137-0","kubernetes_io/metadata_name":"alto"}},"thread":"http-nio-8080-exec-1","serviceName":"login","servicePver":"servicePver_IS_UNDEFINED","imageName":"gcr.io/kumo-scratch/services/login","imageTag":"master--3659","eventId":"login-001","tenantId":"662b4f2c76a0428a9e7faaa64534d67a","eventDescription":"Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller","adminName":"FisrtName 12 LastName 12"}',
  entity_type: 'ADMIN',
  event_datetime: '2022-12-08T14:50:20Z',
  ipAddress: '134.242.133.1',
  id: '2e0d0ce655904d3b8e1404064b1175d9',
  entity_id: '662b4f2c76a0428a9e7faaa64534d67a',
  message: '{ "message_template": "Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller." }'
}, {
  severity: 'Info',
  adminName: '',
  raw_event: '{"stream":"stdout","docker":{"container_id":"2ed4013eaa21517aa615ccfef560f4979e594537a8fbfacf997e894cd9a95fb2"},"kubernetes":{"container_name":"login","namespace_name":"alto","pod_name":"login-64c79b44cb-sklhr","container_image":"sha256:f85e0516b5c169050b1bdffbcff4cf95d153ec8680c810b1d665d4514487167e","container_image_id":"gcr.io/kumo-scratch/services/login@sha256:22942642e04ac9f2a2aeaae828e14eb4c69f619ba5b89062675f41832bbf618a","pod_id":"2fb67f34-52c5-4051-b67d-8379067fa820","labels":{"app":"login","bom":"acx-service-5409-C","build":"3659","build_commit_sha":"6f5e0a979372d6627fe683b8302f7f194ef672b9","deployedby":"shabarish.vaidyanath","deployeddatetime":"2022-12-06-06-37-18","deployedts":"1670308638","lastdeployed":"0","pod-template-hash":"64c79b44cb","primary_protocol":"http","project":"acx","pver_route":"acx","version":"0.0.1","security_istio_io/tlsMode":"istio","service_istio_io/canonical-name":"login","service_istio_io/canonical-revision":"0.0.1","topology_istio_io/network":"alto-dev-200221-alto-devolve"},"host":"gke-devolve-cluster-core-2-302d2f84-w5ok","master_url":"https://10.137.32.1:443/api","namespace_id":"fe9f5068-055c-40cf-b6dc-6ddadf3866ce","namespace_labels":{"argocd_argoproj_io/instance":"argocd-core","istio_io/rev":"asm-1137-0","kubernetes_io/metadata_name":"alto"}},"thread":"http-nio-8080-exec-1","serviceName":"login","servicePver":"servicePver_IS_UNDEFINED","imageName":"gcr.io/kumo-scratch/services/login","imageTag":"master--3659","eventId":"login-001","tenantId":"662b4f2c76a0428a9e7faaa64534d67a","eventDescription":"Admin FisrtName 12 LastName 12, dog12@email.com logged into the cloud controller","adminName":"FisrtName 12 LastName 12"}',
  entity_type: 'ADMIN',
  event_datetime: '2021-12-08T14:50:20Z',
  id: '2e0d0ce655904d3b8e1404064b117501',
  entity_id: '662b4f2c76a0428a9e7faaa64534d67a',
  message: '{ "message_template": "2 Venue’s firmware update has been triggered." }'
}].map(event => ({
  ...event,
  tableKey: event.event_datetime + event.id
}))

export const adminLogsMeta = [{
  id: '2e0d0ce655904d3b8e1404064b1175d9',
  isApExists: false,
  isSwitchExists: false
}, {
  id: '2e0d0ce655904d3b8e1404064b117501',
  isApExists: false,
  isSwitchExists: false
}]


export const adminLogsForQuery = {
  data: adminLogs,
  totalCount: adminLogs.length,
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

export const adminLogsMetaForQuery = {
  data: adminLogsMeta,
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
