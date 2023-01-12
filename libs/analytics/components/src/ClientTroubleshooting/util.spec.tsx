import { TooltipFormatterParams } from '@acx-ui/components'
import { getIntl }                from '@acx-ui/utils'

import {
  SUCCESS,
  SLOW,
  DISCONNECT,
  FAILURE,
  RADIO5G,
  RADIO2DOT4G,
  ROAMED,
  DisplayEvent,
  rssGroups,
  TimelineData,
  TYPES,
  Event,
  ConnectionQuality
} from './config'
import { ConnectionEvent } from './services'
import {
  getConnectionQualityFor,
  takeWorseQuality,
  getQualityColor,
  categorizeEvent,
  transformEvents,
  transformConnectionQualities,
  formatEventDesc,
  connectionDetailsByAP,
  connectionDetailsByApChartData,
  getRssColor,
  rssMax,
  rssMin,
  roamingColorMap,
  roamingEventFormatter,
  getRoamingChartConfig,
  getRoamingSubtitleConfig,
  getChartData,
  useTooltipFormatter
} from './util'

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
describe('Connection quality utils', () => {
  describe('getConnectionQualityFor', () => {
    it('returns correct values for rss', () => {
      const good = getConnectionQualityFor('rss', -10)
      expect(good?.quality).toMatch('good')

      const bad = getConnectionQualityFor('rss', -90)
      expect(bad?.quality).toMatch('bad')

      const average = getConnectionQualityFor('rss', -75)
      expect(average?.quality).toMatch('average')

      const nullVal = getConnectionQualityFor('rss', null)
      expect(nullVal?.quality).toBeNull()

      const undefinedVal = getConnectionQualityFor('rss', undefined)
      expect(undefinedVal?.quality).toBeNull()
    })

    it('returns correct values for snr', () => {
      const good = getConnectionQualityFor('snr', 20)
      expect(good?.quality).toMatch('good')

      const bad = getConnectionQualityFor('snr', 3)
      expect(bad?.quality).toMatch('bad')

      const average = getConnectionQualityFor('snr', 10)
      expect(average?.quality).toMatch('average')

      const nullVal = getConnectionQualityFor('snr', null)
      expect(nullVal?.quality).toBeNull()

      const undefinedVal = getConnectionQualityFor('snr', undefined)
      expect(undefinedVal?.quality).toBeNull()
    })

    it('returns correct values for throughput', () => {
      const good = getConnectionQualityFor('throughput', 3 * 1024)
      expect(good?.quality).toMatch('good')

      const bad = getConnectionQualityFor('throughput', 100)
      expect(bad?.quality).toMatch('bad')

      const average = getConnectionQualityFor('throughput', 1024)
      expect(average?.quality).toMatch('average')

      const nullVal = getConnectionQualityFor('throughput', null)
      expect(nullVal?.quality).toBeNull()

      const undefinedVal = getConnectionQualityFor('throughput', undefined)
      expect(undefinedVal?.quality).toBeNull()
    })

    it('returns correct values for avgTxMCS', () => {
      const good = getConnectionQualityFor('avgTxMCS', 40 * 1024)
      expect(good?.quality).toMatch('good')

      const bad = getConnectionQualityFor('avgTxMCS', 0)
      expect(bad?.quality).toMatch('bad')

      const average = getConnectionQualityFor('avgTxMCS', 15 * 1025)
      expect(average?.quality).toMatch('average')

      const nullVal = getConnectionQualityFor('avgTxMCS', null)
      expect(nullVal?.quality).toBeNull()

      const undefinedVal = getConnectionQualityFor('avgTxMCS', undefined)
      expect(undefinedVal?.quality).toBeNull()
    })
  })

  describe('takeWorseQuality', () => {
    it('returns correct worse quality', () => {
      const testQualities = ['good', 'good', 'average', 'bad']
      const worseQuality = takeWorseQuality(...testQualities)
      expect(worseQuality).toMatch('bad')
    })

    it('returns null on empty quality', () => {
      const emptyQuality = takeWorseQuality(...[])
      expect(emptyQuality).toBeNull()
    })
  })

  describe('getQualityColor', () => {
    it('return correct colors', () => {
      const bad = getQualityColor('bad')
      expect(bad).toMatch('--acx-semantics-red-50')

      const good = getQualityColor('good')
      expect(good).toMatch('--acx-semantics-green-50')

      const average = getQualityColor('average')
      expect(average).toMatch('--acx-semantics-yellow-50')

      const unknown = getQualityColor('unknown')
      expect(unknown).toMatch('--acx-neutrals-50')
    })
  })
})
describe('Events utils', () => {
  const expectedEvents = [
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
      type: 'roaming',
      key: '166840761164694:B3:4F:3D:15:B0EVENT_CLIENT_ROAMING1',
      start: 1668407611646,
      end: 1668407611646,
      category: 'success'
    },
    {
      apName: 'R750-11-112',
      category: 'failure',
      code: 'eapol',
      end: 1668407704571,
      event: 'CCD_REASON_MIC_FAILURE',
      failedMsgId: '22',
      key: '166840770457194:B3:4F:3D:15:B0FAILURE6',
      mac: '94:B3:4F:3D:15:B0',
      path: [
        {
          name: 'cliexp4',
          type: 'zone'
        },
        {
          name: 'No group (inherit from Venue)',
          type: 'apGroup'
        },
        {
          name: '94:B3:4F:3D:15:B0',
          type: 'ap'
        }
      ],
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
    }
  ]
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

  it('should return correct data for transformEvents with no filter', () => {
    expect(transformEvents(connectionEvents, [], [])).toEqual(expectedEvents)
  })
  it('should return correct data for transformEvents with filters', () => {
    expect(transformEvents(connectionEvents, [], [RADIO5G])).toEqual(expectedEvents)
    expect(transformEvents(connectionEvents, [], [RADIO2DOT4G])).toEqual([])
    expect(transformEvents(connectionEvents, [ROAMED], [])).toEqual([expectedEvents[0]])
    expect(transformEvents(connectionEvents, [ROAMED], [RADIO2DOT4G])).toEqual([])
  })
  it('should return correct data for formatEventDesc', () => {
    const data = [
      {
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
      },
      {
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
        desc: 'EAPOL Failure: PSK Failure (passphrase mismatch) - Invalid MIC @ R750-11-112 5 GHz'
      }
    ]
    data.forEach(({ event, desc }) => {
      expect(formatEventDesc(event as DisplayEvent, getIntl())).toEqual(desc)
    })
  })

  describe('transformConnectionQualities', () => {
    it('returns correct values on sample data', () => {
      const testData = [
        {
          start: '2022-12-26T07:09:58.340Z',
          end: '2022-12-26T07:12:00.000Z',
          rss: null,
          snr: 41,
          throughput: 4300,
          avgTxMCS: 8600
        }
      ]

      const matchedData = {
        all: [
          {
            all: { quality: 'bad' },
            avgTxMCS: { quality: 'bad', value: 8600 },
            end: '2022-12-26T07:12:00.000Z',
            rss: { quality: null, value: null },
            seriesKey: 'all',
            snr: { quality: 'good', value: 41 },
            start: '2022-12-26T07:09:58.340Z',
            throughput: { quality: 'good', value: 4300 }
          }
        ],
        avgTxMCS: [
          {
            all: { quality: 'bad' },
            avgTxMCS: { quality: 'bad', value: 8600 },
            end: '2022-12-26T07:12:00.000Z',
            rss: { quality: null, value: null },
            seriesKey: 'avgTxMCS',
            snr: { quality: 'good', value: 41 },
            start: '2022-12-26T07:09:58.340Z',
            throughput: { quality: 'good', value: 4300 }
          }
        ],
        rss: [
          {
            all: { quality: 'bad' },
            avgTxMCS: { quality: 'bad', value: 8600 },
            end: '2022-12-26T07:12:00.000Z',
            rss: { quality: null, value: null },
            seriesKey: 'rss',
            snr: { quality: 'good', value: 41 },
            start: '2022-12-26T07:09:58.340Z',
            throughput: { quality: 'good', value: 4300 }
          }
        ],
        snr: [
          {
            all: { quality: 'bad' },
            avgTxMCS: { quality: 'bad', value: 8600 },
            end: '2022-12-26T07:12:00.000Z',
            rss: { quality: null, value: null },
            seriesKey: 'snr',
            snr: { quality: 'good', value: 41 },
            start: '2022-12-26T07:09:58.340Z',
            throughput: { quality: 'good', value: 4300 }
          }
        ],
        throughput: [
          {
            all: { quality: 'bad' },
            avgTxMCS: { quality: 'bad', value: 8600 },
            end: '2022-12-26T07:12:00.000Z',
            rss: { quality: null, value: null },
            seriesKey: 'throughput',
            snr: { quality: 'good', value: 41 },
            start: '2022-12-26T07:09:58.340Z',
            throughput: { quality: 'good', value: 4300 }
          }
        ]
      }

      const transformedData = transformConnectionQualities(testData)
      expect(transformedData).toStrictEqual(matchedData)
    })
    it('returns empty array for undefined', () => {
      expect(transformConnectionQualities(undefined)).toStrictEqual([])
    })
  })
})
describe('Roaming utils', () => {
  describe('connectionDetailsByAP', () => {
    it('should return grouped ap information', () => {
      const result = connectionDetailsByAP(connectionDetailsByAp)
      expect(result).toEqual({
        '44:1E:98:14:00:80-5': {
          apFirmware: '6.0.0.0.1591',
          apMac: '44:1E:98:14:00:80',
          apModel: 'R710',
          apName: 'SinghAP-R710-RAP',
          radio: '5'
        },
        'EC:8C:A2:0C:3A:20-5': {
          apFirmware: '6.0.0.0.1591',
          apMac: 'EC:8C:A2:0C:3A:20',
          apModel: 'R610',
          apName: 'SinghAP-R610-MAP',
          radio: '5'
        }
      })
    })
  })
  describe('connectionDetailsByApChartData', () => {
    it('should return data for chart format', () => {
      const result = connectionDetailsByApChartData(connectionDetailsByAp)
      expect(result).toEqual({
        '44:1E:98:14:00:80-5': {
          events: [
            {
              color: 'rgba(88, 173, 48, 1)',
              details: {
                apFirmware: '6.0.0.0.1591',
                apMac: '44:1E:98:14:00:80',
                apModel: 'R710',
                apName: 'SinghAP-R710-RAP',
                bandwidth: '80',
                bssid: '44:1E:98:14:00:8C',
                channel: '116',
                end: '2018-12-20T08:28:55.899Z',
                radio: '5',
                radioMode: '11ac',
                rss: -68.5,
                spatialStream: '2',
                ssid: 'singhfi-5g',
                start: '2018-12-20T08:25:55.899Z'
              },
              end: '2018-12-20T08:28:55.899Z',
              label: '44:1E:98:14:00:80-5',
              start: '2018-12-20T08:25:55.899Z',
              value: '-68 dBm'
            }
          ]
        },
        'EC:8C:A2:0C:3A:20-5': {
          events: [
            {
              color: 'rgba(35, 171, 54, 1)',
              details: {
                apFirmware: '6.0.0.0.1591',
                apMac: 'EC:8C:A2:0C:3A:20',
                apModel: 'R610',
                apName: 'SinghAP-R610-MAP',
                bandwidth: '80',
                bssid: 'EC:8C:A2:0C:3A:2C',
                channel: '116',
                end: '2018-12-20T08:25:55.899Z',
                radio: '5',
                radioMode: '11ac',
                rss: -57.5,
                spatialStream: '2',
                ssid: 'singhfi-5g',
                start: '2018-12-20T08:22:55.899Z'
              },
              end: '2018-12-20T08:25:55.899Z',
              label: 'EC:8C:A2:0C:3A:20-5',
              start: '2018-12-20T08:22:55.899Z',
              value: '-57 dBm'
            }
          ]
        }
      })
    })
  })
  describe('getRssColor', () => {
    it('getRssColor should return correct color', () => {
      expect(getRssColor(rssMax + 1)).toEqual(roamingColorMap.max)
      expect(getRssColor(rssMax)).toEqual(roamingColorMap.max)
      expect(getRssColor((rssMax + rssGroups.average.upper) / 2)).toEqual(roamingColorMap.good)
      expect(getRssColor((rssGroups.average.upper + rssGroups.average.lower) / 2)).toEqual(
        roamingColorMap.average
      )
      expect(getRssColor((rssGroups.average.lower + rssMin) / 2)).toEqual(roamingColorMap.bad)
      expect(getRssColor(rssMin)).toEqual(roamingColorMap.min)
      expect(getRssColor(rssMin - 1)).toEqual(roamingColorMap.min)
    })
  })
  describe('roamingEventFormatter', () => {
    const details = {
      rss: -68.5,
      bssid: '44:1E:98:14:00:8C',
      channel: '116',
      radioMode: '11ac',
      spatialStream: '2',
      bandwidth: '80',
      start: '',
      end: '',
      apMac: '',
      apName: '',
      apModel: '',
      apFirmware: '',
      radio: '',
      ssid: ''
    }
    it('should return valid desc', () => {
      expect(roamingEventFormatter(details)).toEqual([
        {
          label: 'RSS / BSSID / Channel / Radio Mode / Spatial Stream (SS) / Bandwidth',
          value: '-68 dBm / 44:1E:98:14:00:8C / 116 / 11ac / 2 SS / 80 MHz'
        }
      ])
    })
  })
  describe('getRoamingChartConfig', () => {
    const roamingData = {
      test1: {
        apMac: 'apmac1',
        radio: 'radio1',
        apName: 'apName1',
        apModel: 'apModel1',
        apFirmware: 'apFirmware1'
      },
      test2: {
        apMac: 'apmac2',
        radio: 'radio2',
        apName: 'apName2',
        apModel: 'apModel2',
        apFirmware: 'apFirmware2'
      }
    }
    it('should return correct chart config', () => {
      expect(getRoamingChartConfig(roamingData)).toEqual([
        { chartType: 'bar', key: 'test1', label: 'apName1', series: 'roaming' },
        { chartType: 'bar', key: 'test2', label: 'apName2', series: 'roaming' }
      ])
    })
  })
  describe('getRoamingSubtitleConfig', () => {
    const roamingData = {
      test1: {
        apMac: 'apmac1',
        radio: 'radio1',
        apName: 'apName1',
        apModel: 'apModel1',
        apFirmware: 'apFirmware1'
      },
      test2: {
        apMac: 'apmac2',
        radio: 'radio2',
        apName: 'apName2',
        apModel: 'apModel2',
        apFirmware: 'apFirmware2'
      }
    }
    it('should return correct chart config', () => {
      expect(getRoamingSubtitleConfig(roamingData)).toEqual([
        { isLast: false, title: 'apName1 on radio1GHz', value: 'apName1' },
        { isLast: true, title: 'apName2 on radio2GHz', value: 'apName2' }
      ])
    })
  })
})
describe('Incidents utils', () => {})

describe('chart utils', () => {
  it('getChartData should return empty array for no match', async () => {
    expect(getChartData(null as unknown as keyof TimelineData, [], false)).toEqual([])
  })
  it('getChartData should return valid events data', async () => {
    expect(
      getChartData(
        TYPES.CONNECTION_EVENTS as unknown as keyof TimelineData,
        [connectionEvents[0]] as unknown as Event[],
        false
      )
    ).toEqual([
      {
        apName: 'R750-11-112',
        code: null,
        event: 'EVENT_CLIENT_JOIN',
        failedMsgId: null,
        mac: '94:B3:4F:3D:15:B0',
        path: [
          { name: 'cliexp4', type: 'zone' },
          { name: 'No group (inherit from Venue)', type: 'apGroup' },
          { name: '94:B3:4F:3D:15:B0', type: 'ap' }
        ],
        radio: '5',
        seriesKey: 'all',
        state: 'join',
        timestamp: '2022-11-14T06:33:31.524Z',
        ttc: null
      }
    ])
  })
  it('getChartData should return empty array for CONNECTION_QUALITY', async () => {
    expect(
      getChartData(
        TYPES.CONNECTION_QUALITY as unknown as keyof TimelineData,
        [] as unknown as Event[],
        false
      )
    ).toEqual([])
    expect(
      getChartData(
        TYPES.CONNECTION_QUALITY as unknown as keyof TimelineData,
        [] as unknown as Event[],
        true
      )
    ).toEqual([])
    // expect(
    //   getChartData(
    //     TYPES.CONNECTION_QUALITY as unknown as keyof TimelineData,
    //     [] as unknown as Event[],
    //     true,
    //     connectionQualities as unknown as ConnectionQuality[]
    //   )
    // ).toEqual([])
  })

  it('getChartData should return empty array for NETWORK_INCIDENTS', async () => {
    expect(
      getChartData(
        TYPES.NETWORK_INCIDENTS as unknown as keyof TimelineData,
        [] as unknown as Event[],
        false
      )
    ).toEqual([])
  })
  it('getChartData should return empty array for ROAMING', async () => {
    expect(
      getChartData(TYPES.ROAMING as unknown as keyof TimelineData, [] as unknown as Event[], false)
    ).toEqual([])
    expect(
      getChartData(TYPES.ROAMING as unknown as keyof TimelineData, [] as unknown as Event[], true)
    ).toEqual([])
  })
  const parameters = [
    {
      data: [
        1668403161155,
        'all',
        {
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
      ]
    }
  ] as TooltipFormatterParams[]
  it('tooltipFormatter should return correct Html string for single value', async () => {
    expect(useTooltipFormatter(parameters)).toMatchSnapshot()
  })
  it('tooltipFormatter should empty Html string for invalid value', async () => {
    expect(useTooltipFormatter([{}] as TooltipFormatterParams[])).toMatchSnapshot()
  })
})
