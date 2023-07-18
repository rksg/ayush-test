export const clientList = {
  data: [
    {
      trafficToClient: 361400785,
      clientMac: '3c:22:fb:97:c7:ef',
      ssid: 'NMS-app6-WLAN',
      sessStartTime: 1669693917,
      packetsToClient: 577273,
      hostname: 'MBP',
      trafficFromClient: 141104448,
      receiveSignalStrength: -42,
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      osType: 'macOS',
      deviceTypeStr: 'Laptop',
      networkId: 'b2086d07eac34419953e00be56ff01b4',
      packetsFromClient: 353909,
      healthCheckStatus: 'Good',
      rssi: 54,
      encryptMethod: 'WPA2-AES',
      serialNumber: '422039000034',
      ipAddress: '10.206.1.189',
      totalTraffic: 502505233,
      Username: '3c22fb97c7ef',
      clientVlan: 1,
      healthStatusReason: 'RSSI is Good\nSNR is Good\nThroughput is Good',
      noiseFloor: -96,
      packetsDropFrom: 0,
      status: 0,
      lastUpdateTime: '2022-11-29T07:43:15.658Z'
    },
    {
      trafficToClient: 61221,
      clientMac: 'aa:5c:7a:99:38:a2',
      ssid: 'NMS-app6-WLAN',
      sessStartTime: 1669707746,
      radio: { mode: 'a/n', channel: 104 },
      packetsToClient: 488,
      hostname: 'iphone',
      trafficFromClient: 2644,
      receiveSignalStrength: -44,
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      osType: 'iOS',
      deviceTypeStr: 'Smartphone',
      networkId: 'b2086d07eac34419953e00be56ff01b4',
      packetsFromClient: 28,
      healthCheckStatus: 'Good',
      rssi: 52,
      serialNumber: '422039000034',
      ipAddress: '10.206.1.25',
      modelName: 'iOS Phone',
      Username: 'aa5c7a9938a2',
      clientVlan: 1,
      authmethod: 'Standard+Open',
      healthStatusReason: 'RSSI is Good\nSNR is Good\nThroughput is Good',
      noiseFloor: -96,
      packetsDropFrom: 0,
      status: 1,
      lastUpdateTime: '2022-11-29T07:43:15.658Z'
    },
    {
      clientMac: '',
      ssid: 'NMS-app6-JK-acx-hybrid',
      sessStartTime: 1669686655,
      radio: { mode: 'a/n/ac', channel: 104 },
      hostname: '',
      venueId: '4c778ed630394b76b17bce7fe230cf9f',
      osType: 'macOS',
      deviceTypeStr: 'Laptop',
      networkId: 'f71a3a2b7051449c941ae18691ca31cb',
      healthCheckStatus: 'Good',
      encryptMethod: 'WPA2-AES',
      serialNumber: '422039000034',
      ipAddress: '',
      totalTraffic: 36368390,
      modelName: 'Mac OS X',
      switchName: 'mock-test',
      Username: '',
      authmethod: 'Standard+Open',
      healthStatusReason: 'RSSI is Good\nSNR is Good\nThroughput is Good',
      packetsDropFrom: 0,
      status: 1,
      lastUpdateTime: '2022-11-29T07:43:15.658Z'
    }
  ],
  subsequentQueries: [
    {
      fields: ['switchSerialNumber', 'venueName', 'apName', 'switchName'],
      url: '/api/viewmodel/d1ec841a4ff74436b23bca6477f6a631/client/meta'
    }
  ],
  totalCount: 3
}

export const clientMeta = {
  data: [
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:97:c7:ef',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: '3c:22:fb:c9:ab:2d',
      apName: 'UI team AP'
    },
    {
      venueName: 'My-Venue',
      clientMac: 'aa:5c:7a:99:38:a2',
      apName: 'UI team AP'
    }
  ]
}
