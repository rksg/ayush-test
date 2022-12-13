import { getIntl } from '@acx-ui/utils'

import {
  categorizeEvent,
  transformEvents,
  formatEventDesc,
  SUCCESS,
  SLOW,
  DISCONNECT,
  FAILURE,
  RADIO5G,
  RADIO2DOT4G,
  ROAMED
} from './config'
import { ConnectionEvent } from './services'

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
    radio: '5'
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
    radio: '5'
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
    radio: '5'
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
    radio: '5'
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
    radio: '5'
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
    radio: '5'
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
    radio: '5'
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
    radio: '5'
  }
]
describe('Config utils', () => {
  const expectedEvents = [{
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
    type: 'roaming',
    key: '166840761164694:B3:4F:3D:15:B0EVENT_CLIENT_ROAMING1',
    start: 1668407611646,
    end: 1668407611646,
    category: 'success'
  }, {
    apName: 'R750-11-112',
    category: 'failure',
    code: 'eapol',
    end: 1668407704571,
    event: 'CCD_REASON_MIC_FAILURE',
    failedMsgId: '22',
    key: '166840770457194:B3:4F:3D:15:B0FAILURE6',
    mac: '94:B3:4F:3D:15:B0',
    path: [{
      name: 'cliexp4',
      type: 'zone'
    }, {
      name: 'No group (inherit from Venue)',
      type: 'apGroup'
    }, {
      name: '94:B3:4F:3D:15:B0',
      type: 'ap'
    }],
    radio: '5',
    start: 1668407704571,
    state: 'normal',
    timestamp: '2022-11-14T06:35:04.571Z',
    ttc: null,
    type: 'connectionEvents'
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
    type: 'connectionEvents',
    key: '166840770744194:B3:4F:3D:15:B0EVENT_CLIENT_DISCONNECT7',
    start: 1668407707441,
    end: 1668407707441,
    category: 'disconnect'
  }]
  it('should return correct data for categorizeEvent', () => {
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

  it('should return correct data for transformEvents with no filter',() => {
    expect(transformEvents(connectionEvents, [], [])).toEqual(expectedEvents)
  })
  it('should return correct data for transformEvents with filters',() => {
    expect(transformEvents(connectionEvents, [], [RADIO5G])).toEqual(expectedEvents)
    expect(transformEvents(connectionEvents, [], [RADIO2DOT4G])).toEqual([])
    expect(transformEvents(connectionEvents, [ROAMED], [])).toEqual([expectedEvents[0]])
    expect(transformEvents(connectionEvents, [ROAMED], [RADIO2DOT4G])).toEqual([])
  })
  it('should return correct data for formatEventDesc', () => {
    const data = [{
      event: {
        event: 'EVENT_CLIENT_DISCONNECT',
        mac: '94:B3:4F:3D:15:B0',
        apName: 'R750-11-112',
        code: null,
        state: 'normal',
        failedMsgId: '3',
        radio: '5',
        start: 1668407707441,
        end: 1668407707441,
        category: 'disconnect'
      },
      desc: 'Client disconnected @ R750-11-112 (94:B3:4F:3D:15:B0) 5 GHz'
    }, {
      event: {
        apName: 'R750-11-112',
        category: 'failure',
        code: 'eapol',
        end: 1668407704571,
        event: 'CCD_REASON_MIC_FAILURE',
        failedMsgId: '22',
        mac: '',
        radio: '5',
        start: 1668407704571,
        state: 'normal',
        type: 'connectionEvents'
      },
      desc: 'EAPOL: PSK Failure (passphrase mismatch) - Invalid MIC @ R750-11-112 5 GHz'
    }]
    data.forEach(({ event, desc }) => {
      expect(formatEventDesc(event, getIntl())).toEqual(desc)
    })
  })
})
