
import {
  categorizeEvent,
  transformEvents,
  SUCCESS,
  SLOW,
  DISCONNECT,
  FAILURE
} from './config'
import { ConnectionEvent } from './services'

const connectionEvents: ConnectionEvent[] = [
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
    messageIds: null,
    radio: '5',
    ssid: 'CIOT_WPA2'
  },
  {
    timestamp: '2022-11-14T06:33:31.646Z',
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
    ssid: 'CIOT_WPA2'
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
    messageIds: null,
    radio: '5',
    ssid: 'CIOT_WPA2'
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
    messageIds: null,
    radio: '5',
    ssid: 'CIOT_WPA2'
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
    messageIds: null,
    radio: '5',
    ssid: 'CIOT_WPA2'
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
    messageIds: null,
    radio: '5',
    ssid: 'CIOT_WPA2'
  },
  {
    timestamp: '2022-11-14T06:35:04.571Z',
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
    messageIds: null,
    radio: '5',
    ssid: 'CIOT_WPA2'
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
    messageIds: null,
    radio: '5',
    ssid: 'CIOT_WPA2'
  }
]
describe('Config utils', () => {
  it('should return correct data for categorizeEvent',() => {
    const expectedResult = [
      { event: 'EVENT_CLIENT_DISCONNECT', ttc: null, category: DISCONNECT },
      { event: 'EVENT_CLIENT_ROAMING', ttc: 5000, category: SLOW },
      { event: 'EVENT_CLIENT_SPURIOUS_INFO_UPDATED', ttc: null, category: FAILURE },
      { event: 'EVENT_CLIENT_ROAMING', ttc: 2000, category: SUCCESS }
    ]
    expectedResult.forEach(({ event, ttc, category }) => {
      expect(categorizeEvent(event, ttc)).toEqual(category)
    })
  })

  it('should return correct data for transformEvents',() => {
    const expectedResult = [{
      timestamp: '2022-11-14T06:33:31.646Z',
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
      ssid: 'CIOT_WPA2',
      type: 'connectionEvents',
      key: '166840761164694:B3:4F:3D:15:B0EVENT_CLIENT_INFO_UPDATED1',
      start: 1668407611646,
      end: 1668407611646,
      category: 'success'
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
      messageIds: null,
      radio: '5',
      ssid: 'CIOT_WPA2',
      type: 'connectionEvents',
      key: '166840770744194:B3:4F:3D:15:B0EVENT_CLIENT_DISCONNECT7',
      start: 1668407707441,
      end: 1668407707441,
      category: 'disconnect'
    }]
    expect(transformEvents(connectionEvents, [], [])).toEqual(expectedResult)
  })

})
