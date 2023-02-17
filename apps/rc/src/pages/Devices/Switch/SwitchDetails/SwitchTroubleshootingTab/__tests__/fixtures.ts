export const doRunResponse = {
  requestId: '1047d650-e527-4d46-a7d3-8b7875fba6fc',
  response: {}
}

export const troubleshootingResult_ping_isSyncing = {
  requestId: 'd674eda1-1ced-4d18-9041-fdfa7fda606e',
  response: {
    latestResultResponseTime: '2023-01-09T03:27:22.095+00:00',
    pingIp: '1.1.1.1',
    traceRouteTtl: 0,
    syncing: true,
    troubleshootingType: 'ping'
  }
}

export const troubleshootingResult_ping_result = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    // eslint-disable-next-line max-len
    result: 'Sending 5, 16-byte ICMP Echo to 1.1.1.1, timeout 5000 msec, TTL 64\nType Control-c to abort\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=1ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=1ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nSuccess rate is 100 percent (5/5), round-trip min/avg/max=1/1/2 ms.\n',
    pingIp: '1.1.1.1',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'ping'
  }
}

export const troubleshootingResult_ping_emptyResult = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'EMPTY_RESULT',
    pingIp: '1.1.1.1',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'ping'
  }
}

export const troubleshootingResult_ping_empty = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'ping'
  }
}

export const troubleshootingResult_route_result = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    latestResultResponseTime: '2023-01-10T10:42:25.523+00:00',
    // eslint-disable-next-line max-len
    result: 'show ip route\nTotal number of IP routes: 3\nType Codes - B:BGP D:Connected O:OSPF R:RIP S:Static; Cost - Dist/Metric\nBGP  Codes - i:iBGP e:eBGP\nOSPF Codes - i:Inter Area 1:External Type 1 2:External Type 2\nSTATIC Codes - v:Inter-VRF\n        Destination        Gateway         Port          Cost          Type Uptime\n1       0.0.0.0/0          10.206.11.254   ve 1          254/1         S    8h59m \n2       1.1.1.0/24         10.206.11.252   ve 1          252/1         S    52m29s\n3       10.206.10.0/23     DIRECT          ve 1          0/0           D    8h59m \n',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'route-table'
  }
}

export const troubleshootingResult_route_empty = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'route-table'
  }
}

export const troubleshootingResult_route_syncing = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    traceRouteTtl: 0,
    syncing: true,
    troubleshootingType: 'route-table'
  }
}

export const troubleshootingResult_route_emptyResult = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'EMPTY_RESULT',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'route-table'
  }
}

export const troubleshootingResult_traceRoute_empty = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'trace-route'
  }
}

export const troubleshootingResult_traceRoute_syncing = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    traceRouteTtl: 255,
    traceRouteTarget: '1.1.1.1',
    syncing: true,
    troubleshootingType: 'trace-route'
  }
}

export const troubleshootingResult_traceRoute_emptyResult = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'EMPTY_RESULT',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'trace-route'
  }
}

export const troubleshootingResult_traceRoute_result = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    // eslint-disable-next-line max-len
    result: 'Sending 5, 16-byte ICMP Echo to 1.1.1.1, timeout 5000 msec, TTL 64\nType Control-c to abort\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=1ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=1ms TTL=58\nReply from 1.1.1.1 : bytes=16 time=2ms TTL=58\nSuccess rate is 100 percent (5/5), round-trip min/avg/max=1/1/2 ms.\n',
    traceRouteTarget: '1.1.1.1',
    traceRouteTtl: 255,
    syncing: false,
    troubleshootingType: 'trace-route'
  }
}

export const troubleshootingResult_macaddress_timeout = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'Troubleshooting response is timeout',
    macAddressTableType: 'none',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'mac-address-table'
  }
}

export const troubleshootingResult_macaddress_port = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'Troubleshooting response is timeout',
    macAddressTableType: 'connected_port',
    traceRouteTtl: 0,
    syncing: false,
    macAddressTablePortIdentify: '1/1/1',
    troubleshootingType: 'mac-address-table'
  }
}

export const troubleshootingResult_macaddress_vlan = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'Troubleshooting response is timeout',
    macAddressTableType: 'vlan',
    traceRouteTtl: 0,
    syncing: false,
    macAddressTableVlanId: '1',
    troubleshootingType: 'mac-address-table'
  }
}

export const troubleshootingResult_macaddress_mac = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'Troubleshooting response is timeout',
    macAddressTableType: 'mac_address',
    traceRouteTtl: 0,
    syncing: false,
    macAddressTableAddress: '11:11:11:11:11:11',
    troubleshootingType: 'mac-address-table'
  }
}

export const troubleshootingResult_macaddress_result = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    // eslint-disable-next-line max-len, no-useless-escape
    result: '{\"entry\":[{\"mac-address\":\"d4:c1:9e:17:67:e7\",\"vlan\":1,\"config\":{\"mac-address\":\"d4:c1:9e:17:67:e7\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"80:03:84:00:bb:e0\",\"vlan\":1,\"config\":{\"mac-address\":\"80:03:84:00:bb:e0\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"58:fb:96:0e:c0:c4\",\"vlan\":1,\"config\":{\"mac-address\":\"58:fb:96:0e:c0:c4\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"ethernet 1/3/1\"},\"state\":{}}}},{\"mac-address\":\"d4:c1:9e:30:02:00\",\"vlan\":1,\"config\":{\"mac-address\":\"d4:c1:9e:30:02:00\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"34:20:e3:2c:b5:b0\",\"vlan\":1,\"config\":{\"mac-address\":\"34:20:e3:2c:b5:b0\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"58:fb:96:0e:82:8a\",\"vlan\":1,\"config\":{\"mac-address\":\"58:fb:96:0e:82:8a\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"58:fb:96:0e:81:b2\",\"vlan\":1,\"config\":{\"mac-address\":\"58:fb:96:0e:81:b2\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:23:eb\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:23:eb\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"d4:c1:9e:84:56:b0\",\"vlan\":1,\"config\":{\"mac-address\":\"d4:c1:9e:84:56:b0\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"e8:f7:24:0f:65:46\",\"vlan\":1,\"config\":{\"mac-address\":\"e8:f7:24:0f:65:46\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"94:f6:65:1a:76:c0\",\"vlan\":1,\"config\":{\"mac-address\":\"94:f6:65:1a:76:c0\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"00:0c:29:89:1f:d2\",\"vlan\":1,\"config\":{\"mac-address\":\"00:0c:29:89:1f:d2\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"50:f7:22:70:67:f3\",\"vlan\":1,\"config\":{\"mac-address\":\"50:f7:22:70:67:f3\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"68:05:ca:22:1a:42\",\"vlan\":1,\"config\":{\"mac-address\":\"68:05:ca:22:1a:42\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"d4:c1:9e:18:cd:3a\",\"vlan\":1,\"config\":{\"mac-address\":\"d4:c1:9e:18:cd:3a\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"68:05:ca:29:f3:91\",\"vlan\":1,\"config\":{\"mac-address\":\"68:05:ca:29:f3:91\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"68:05:ca:22:11:5b\",\"vlan\":1,\"config\":{\"mac-address\":\"68:05:ca:22:11:5b\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"2c:4d:54:44:c2:22\",\"vlan\":1,\"config\":{\"mac-address\":\"2c:4d:54:44:c2:22\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:33:2d\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:33:2d\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c8:03:f5:1c:23:c6\",\"vlan\":1,\"config\":{\"mac-address\":\"c8:03:f5:1c:23:c6\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:34:17\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:34:17\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"d4:c1:9e:84:4a:62\",\"vlan\":1,\"config\":{\"mac-address\":\"d4:c1:9e:84:4a:62\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:31:e9\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:31:e9\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:24:57\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:24:57\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:23:fd\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:23:fd\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"d4:c1:9e:84:59:4a\",\"vlan\":1,\"config\":{\"mac-address\":\"d4:c1:9e:84:59:4a\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:32:c1\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:32:c1\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"58:fb:96:0e:bc:f8\",\"vlan\":1,\"config\":{\"mac-address\":\"58:fb:96:0e:bc:f8\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:32:f7\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:32:f7\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:32:55\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:32:55\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c8:03:f5:1c:24:44\",\"vlan\":1,\"config\":{\"mac-address\":\"c8:03:f5:1c:24:44\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:33:99\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:33:99\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:35:fd\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:35:fd\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:32:43\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:32:43\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:24:33\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:24:33\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:36:e7\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:36:e7\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:36:21\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:36:21\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:32:31\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:32:31\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"58:fb:96:0e:82:d2\",\"vlan\":1,\"config\":{\"mac-address\":\"58:fb:96:0e:82:d2\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:24:7b\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:24:7b\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:34:05\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:34:05\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:33:87\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:33:87\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:28:6b\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:28:6b\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:32:0d\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:32:0d\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:aa:33:3f\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:aa:33:3f\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}},{\"mac-address\":\"c0:c5:20:b2:10:bd\",\"vlan\":1,\"config\":{\"mac-address\":\"c0:c5:20:b2:10:bd\",\"vlan\":1},\"state\":{},\"interface\":{\"interface-ref\":{\"config\":{\"interface\":\"lag 2\"},\"state\":{}}}}]}',
    macAddressTableType: 'none',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'mac-address-table'
  }
}

export const troubleshootingResult_macaddress_empty = {
  requestId: '3875b3ad-eda1-470a-9a94-90f259907317',
  response: {
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'mac-address-table'
  }
}


export const troubleshootingResult_macaddress_emptyResult = {
  requestId: '3d618952-4c53-4a81-a1a7-7d0f9b5e56fe',
  response: {
    latestResultResponseTime: '2023-01-09T03:39:04.114+00:00',
    result: 'EMPTY_RESULT',
    traceRouteTtl: 0,
    syncing: false,
    troubleshootingType: 'mac-address-table'
  }
}

export const portlist = {
  fields: [
    'portIdentifier',
    'id'
  ],
  totalCount: 16,
  page: 1,
  data: [
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/1',
      id: 'c0-c5-20-aa-32-79_1-1-1',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/10',
      id: 'c0-c5-20-aa-32-82_1-1-10',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/11',
      id: 'c0-c5-20-aa-32-83_1-1-11',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/12',
      id: 'c0-c5-20-aa-32-84_1-1-12',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/2',
      id: 'c0-c5-20-aa-32-7a_1-1-2',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/3',
      id: 'c0-c5-20-aa-32-7b_1-1-3',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/4',
      id: 'c0-c5-20-aa-32-7c_1-1-4',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/5',
      id: 'c0-c5-20-aa-32-7d_1-1-5',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/6',
      id: 'c0-c5-20-aa-32-7e_1-1-6',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/7',
      id: 'c0-c5-20-aa-32-7f_1-1-7',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/8',
      id: 'c0-c5-20-aa-32-80_1-1-8',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/1/9',
      id: 'c0-c5-20-aa-32-81_1-1-9',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/2/1',
      id: 'c0-c5-20-aa-32-86_1-2-1',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/2/2',
      id: 'c0-c5-20-aa-32-87_1-2-2',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/3/1',
      id: 'c0-c5-20-aa-32-88_1-3-1',
      lagId: '0',
      syncedSwitchConfig: false
    },
    {
      cloudPort: false,
      stack: false,
      poeUsed: 0,
      poeTotal: 0,
      signalIn: 0,
      signalOut: 0,
      poeEnabled: false,
      usedInFormingStack: false,
      portIdentifier: '1/3/2',
      id: 'c0-c5-20-aa-32-89_1-3-2',
      lagId: '0',
      syncedSwitchConfig: false
    }
  ]
}

export const vlanlist = {
  data: [{
    vlanId: 1
  }, {
    vlanId: 2
  }]
}

