import { Incident }   from '@acx-ui/analytics/utils'
import { cssStr }     from '@acx-ui/components'
import { renderHook } from '@acx-ui/test-utils'

import {
  getDataWithPercentage,
  getDominance,
  getWLANDominance,
  getDominanceByThreshold,
  getAPRebootReason,
  transformAirtimeMetricKey,
  transformAirtimeFrame,
  transformAirtimeCast,
  transformAirtimeClientsByAP,
  getAirtimeMetricColorSet
} from './config'

describe('getDataWithPercentage', () => {
  it('should return correct data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDataWithPercentage(data)).toEqual([
      {
        key: 'ssid1',
        percentage: 0.6666666666666666,
        value: 2
      },
      {
        key: 'ssid2',
        percentage: 0.3333333333333333,
        value: 1
      }
    ])
  })
  it('should return correct data when no data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 0 },
      { key: 'ssid2', name: 'ssid2', value: 0 }
    ]
    expect(getDataWithPercentage(data)).toEqual([
      { key: 'ssid1', percentage: 0, value: 0 },
      { key: 'ssid2', percentage: 0, value: 0 }
    ])
  })
})

describe('getDominance', () => {
  it('should return correct data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominance(data)).toEqual({
      key: 'ssid1',
      percentage: 0.6666666666666666,
      value: 2
    })
  })
})

describe('getDominanceByThreshold', () => {
  it('should return correct data', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominanceByThreshold(0.5)(data)).toEqual({
      key: 'ssid1',
      percentage: 0.6666666666666666,
      value: 2
    })
  })
  it('should return null when result less than threshold', () => {
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominanceByThreshold(0.7)(data)).toEqual(null)
  })
  it('should return null when key is Others', () => {
    const data = [
      { key: 'Others', name: 'Others', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getDominanceByThreshold(0.5)(data)).toEqual(null)
  })
})

describe('getWLANDominance', () => {
  it('should return null when no ssid', () => {
    const incident = { id: 'id', metadata: { dominant: { } } } as Incident
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getWLANDominance(data, incident)).toEqual(null)
  })
  it('should return correct data', () => {
    const incident = { id: 'id', metadata: { dominant: { ssid: 'ssid2' } } } as Incident
    const data = [
      { key: 'ssid1', name: 'ssid1', value: 2 },
      { key: 'ssid2', name: 'ssid2', value: 1 }
    ]
    expect(getWLANDominance(data, incident)).toEqual({
      key: 'ssid2',
      percentage: 0.3333333333333333,
      value: 1
    })
  })
})

describe('getAPRebootReason', () => {
  it('return key if no mapping', () => {
    const key = 'random_key_123'
    const { current } = renderHook(() => getAPRebootReason(key)).result
    expect(current).toEqual(key)
  })
  it('return value of given key', () => {
    const key = 'system recovery by watchdog'
    const { current } = renderHook(() => getAPRebootReason(key)).result
    expect(current).toEqual('system recovery by WatchDog')
  })
})

it('transformAirtimeMetricKey should return correct key', () => {
  expect(transformAirtimeMetricKey('airtimeBusy')).toBe('Avg Airtime Busy')
  expect(transformAirtimeMetricKey('airtimeRx')).toBe('Avg Airtime Rx')
  expect(transformAirtimeMetricKey('airtimeTx')).toBe('Avg Airtime Tx')
  expect(transformAirtimeMetricKey('airtimeIdle')).toBe('Avg Airtime Idle')
  expect(transformAirtimeMetricKey('random')).toBe('')
})

it('transformAirtimeFrame should return correct key', () => {
  expect(transformAirtimeFrame('mgmtFrames')).toBe('Mgmt. Frames')
  expect(transformAirtimeFrame('dataFrames')).toBe('Data Frames')
})

it('transformAirtimeCast should return correct key', () => {
  expect(transformAirtimeCast('txUnicastFrames')).toBe('Unicast Frames')
  expect(transformAirtimeCast('txBroadcastFrames')).toBe('Broadcast Frames')
  expect(transformAirtimeCast('txMulticastFrames')).toBe('Multicast Frames')
})

it('transformAirtimeClientsByAP should return correct key', () => {
  expect(transformAirtimeClientsByAP('small')).toBe('Less than 30 clients')
  expect(transformAirtimeClientsByAP('medium')).toBe('31 to 50 clients')
  expect(transformAirtimeClientsByAP('large')).toBe('More than 50 clients')
})

it('getAirtimeMetricColorSet', () => {
  expect(getAirtimeMetricColorSet()).toEqual([
    cssStr('--acx-viz-qualitative-1'),
    cssStr('--acx-viz-qualitative-2'),
    cssStr('--acx-viz-qualitative-3'),
    cssStr('--acx-viz-qualitative-5'),
    cssStr('--acx-viz-qualitative-6'),
    cssStr('--acx-viz-qualitative-7'),
    cssStr('--acx-viz-qualitative-8'),
    cssStr('--acx-viz-qualitative-9'),
    cssStr('--acx-viz-qualitative-10'),
    cssStr('--acx-viz-qualitative-11'),
    cssStr('--acx-viz-qualitative-12'),
    cssStr('--acx-viz-qualitative-13'),
    cssStr('--acx-viz-qualitative-14'),
    cssStr('--acx-viz-qualitative-15'),
    cssStr('--acx-viz-qualitative-16'),
    cssStr('--acx-viz-qualitative-17'),
    cssStr('--acx-viz-qualitative-18'),
    cssStr('--acx-viz-qualitative-19'),
    cssStr('--acx-viz-qualitative-20'),
    cssStr('--acx-viz-qualitative-21'),
    cssStr('--acx-viz-qualitative-22'),
    cssStr('--acx-viz-qualitative-23'),
    cssStr('--acx-viz-qualitative-24'),
    cssStr('--acx-viz-qualitative-25'),
    cssStr('--acx-viz-qualitative-26'),
    cssStr('--acx-viz-qualitative-27'),
    cssStr('--acx-viz-qualitative-28'),
    cssStr('--acx-viz-qualitative-29'),
    cssStr('--acx-viz-qualitative-30')
  ])
})