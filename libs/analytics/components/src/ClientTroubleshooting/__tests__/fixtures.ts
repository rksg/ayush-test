import { ConnectionEvent } from '../services'

export const connectionDetailsByAp = [
  {
    apMac: 'EC:8C:A2:0C:3A:20',
    start: '2018-12-20T08:22:55.899Z',
    channel: '116',
    spatialStream: '2',
    apFirmware: '6.0.0.0.1591',
    bandwidth: '80',
    rss: -57.5,
    apModel: 'R610',
    apName: 'SinghAP-R610-MAP',
    end: '2018-12-20T08:25:55.899Z',
    ssid: 'singhfi-5g',
    radio: '5',
    bssid: 'EC:8C:A2:0C:3A:2C',
    radioMode: '11ac'
  },
  {
    apMac: '44:1E:98:14:00:80',
    start: '2018-12-20T08:25:55.899Z',
    channel: '116',
    spatialStream: '2',
    apFirmware: '6.0.0.0.1591',
    bandwidth: '80',
    rss: -68.5,
    apModel: 'R710',
    apName: 'SinghAP-R710-RAP',
    end: '2018-12-20T08:28:55.899Z',
    ssid: 'singhfi-5g',
    radio: '5',
    bssid: '44:1E:98:14:00:8C',
    radioMode: '11ac'
  }
]
export const connectionEvents: ConnectionEvent[] = [
  {
    timestamp: '2022-11-14T06:33:31.524Z',
    event: 'EVENT_CLIENT_JOIN',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: null,
    state: 'join',
    failedMsgId: null,
    radio: '5',
    key: 'first_event'
  },
  {
    timestamp: '2022-11-14T06:33:31.646Z',
    event: 'EVENT_CLIENT_ROAMING',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: null,
    state: 'normal',
    failedMsgId: null,
    radio: '5',
    key: 'second_event'
  },
  {
    timestamp: '2022-11-14T06:33:31.976Z',
    event: 'EVENT_CLIENT_INFO_UPDATED',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: null,
    state: 'spurious-info-updated',
    failedMsgId: null,
    radio: '5',
    key: 'third_event'
  },
  {
    timestamp: '2022-11-14T06:33:33.049Z',
    event: 'EVENT_CLIENT_INFO_UPDATED',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: null,
    state: 'spurious-info-updated',
    failedMsgId: null,
    radio: '5',
    key: 'fourth_event'
  },
  {
    timestamp: '2022-11-14T06:33:33.130Z',
    event: 'EVENT_CLIENT_INFO_UPDATED',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: null,
    state: 'spurious-info-updated',
    failedMsgId: null,
    radio: '5',
    key: 'fifth_event'
  },
  {
    timestamp: '2022-11-14T06:33:34.036Z',
    event: 'EVENT_CLIENT_INFO_UPDATED',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: null,
    state: 'spurious-info-updated',
    failedMsgId: null,
    radio: '5',
    key: 'sixth_event'
  },
  {
    timestamp: '2022-11-14T06:35:04.571Z',
    event: 'CCD_REASON_MIC_FAILURE',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: 'eap',
    state: 'normal',
    failedMsgId: '22',
    radio: '5',
    key: 'seventh_event'
  },
  {
    timestamp: '2022-11-14T06:35:07.441Z',
    event: 'EVENT_CLIENT_DISCONNECT',
    ttc: null,
    mac: '94:B3:4F:3D:15:B0',
    apName: 'R750-11-112',
    path: [
      {
        type: 'zone',
        name: 'cliexp4'
      },
      {
        type: 'apGroup',
        name: 'No group (inherit from Venue)'
      },
      {
        type: 'ap',
        name: '94:B3:4F:3D:15:B0'
      }
    ],
    code: null,
    state: 'normal',
    failedMsgId: '3',
    radio: '5',
    key: 'eighth_event'
  }
]
export const connectionQualities = [
  {
    start: '2022-12-26T07:09:58.340Z',
    end: '2022-12-26T07:12:00.000Z',
    rss: null,
    snr: 'good',
    throughput: 'good',
    avgTxMCS: 'bad',
    all: 'bad'
  },
  {
    start: '2022-12-26T07:12:00.000Z',
    end: '2022-12-26T07:15:00.000Z',
    rss: 'good',
    snr: null,
    throughput: 'good',
    avgTxMCS: 'good',
    all: 'good'
  },
  {
    start: '2022-12-26T07:15:00.000Z',
    end: '2022-12-26T07:18:00.000Z',
    rss: 'good',
    snr: 'good',
    throughput: null,
    avgTxMCS: 'good',
    all: 'good'
  },
  {
    start: '2022-12-26T10:15:00.000Z',
    end: '2022-12-26T10:18:00.000Z',
    rss: 'good',
    snr: 'good',
    throughput: 'good',
    avgTxMCS: null,
    all: 'good'
  }
]
const event = {
  timestamp: '2022-11-14T05:19:21.155Z',
  event: 'EVENT_CLIENT_INFO_UPDATED',
  ttc: null,
  mac: '94:B3:4F:3D:15:B0',
  apName: 'R750-11-112',
  path: [
    {
      type: 'zone',
      name: 'cliexp4'
    },
    {
      type: 'apGroup',
      name: 'No group (inherit from Venue)'
    },
    {
      type: 'ap',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  code: null,
  state: 'normal',
  failedMsgId: null,
  messageIds: null,
  radio: '5',
  ssid: 'cliexp4',
  type: 'connectionEvents',
  key: '166840316115594:B3:4F:3D:15:B0EVENT_CLIENT_INFO_UPDATED384',
  start: 1668403161155,
  end: 1668403161155,
  category: 'success',
  seriesKey: 'all'
}
export const qualityDataObj = [
  1668403161155,
  'all',
  1668153505931,
  {
    start: 1668403161155,
    end: 1668403161155,
    rss: {
      quality: 'good',
      value: -74
    },
    snr: {
      quality: 'good',
      value: 15
    },
    throughput: {
      quality: 'good',
      value: 1024 * 3
    },
    avgTxMCS: {
      quality: 'good',
      value: 1024 * 37
    },
    all: {
      quality: 'good'
    },
    seriesKey: 'all',
    icon: ''
  }
]
export const incidentDataObj = [
  1668403161155,
  'all',
  1668403261155,
  {
    id: '84ae70f3-92d9-4a10-b575-71809cf55e4e',
    start: 1668403161155,
    end: 1668403261155,
    date: 'Dec 23 2022 00:30:00',
    description: 'Infrastructure (Service Availability)',
    title: 'AP service is affected due to high number of AP reboots',
    icon: '',
    code: 'i-apserv-continuous-reboots',
    color: '--acx-semantics-yellow-50'
  }
]
export const roamingDataObj = [
  1668403161155,
  '18:4B:0D:1C:A2:40-5',
  1668403261155,
  {
    start: 1668403161155,
    end: 1668403261155,
    label: '18:4B:0D:1C:A2:40-5',
    value: '-73 dBm',
    color: 'rgba(194, 178, 36, 1)',
    details: {
      start: 1668403161155,
      end: 1668403261155,
      apMac: '18:4B:0D:1C:A2:40',
      apName: 'RSSI-AC_AP',
      apModel: 'R710',
      apFirmware: '6.2.0.103.513',
      channel: '144',
      radio: '5',
      radioMode: '11ac',
      ssid: 'CIOT_WPA2',
      spatialStream: '2',
      bandwidth: '80',
      rss: -73,
      bssid: '18:4B:0D:5C:A2:4C'
    }
  }
]
export const eventDataObj = [1668403161155, 'all', { ...event }]