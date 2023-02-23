import { MessageDescriptor, useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { fetchServiceGuardTest }                                        from './__tests__/fixtures'
import { AuthenticationMethod, NetworkHealthConfig, NetworkHealthTest } from './types'
import {
  stagesFromConfig,
  StatsFromSummary,
  statsFromSummary,
  formatApsUnderTest,
  formatLastResult
}                                                                       from './utils'

describe('stagesFromConfig', () => {
  it('returns stages when extra tests are configured', () => {
    const { result } = renderHook(() =>
      stagesFromConfig(fetchServiceGuardTest.serviceGuardTest.config as NetworkHealthConfig)
        .map((set:{ key: string, title: MessageDescriptor }) => ({
          ...set, title: useIntl().$t(set.title) })))
    expect(result.current).toEqual([
      { key: 'auth', title: '802.11 Auth' },
      { key: 'assoc', title: 'Association' },
      { key: 'eap', title: 'PSK' },
      { key: 'dhcp', title: 'DHCP' },
      { key: 'dns', title: 'DNS' },
      { key: 'ping', title: 'Ping' },
      { key: 'traceroute', title: 'Traceroute' },
      { key: 'speedTest', title: 'Speed Test' }
    ])
  })

  it('returns stages when extra tests are not configured', () => {
    const config = {
      ...fetchServiceGuardTest.serviceGuardTest.config,
      authenticationMethod: AuthenticationMethod.OPEN_AUTH,
      pingAddress: null,
      tracerouteAddress: null,
      speedTestEnabled: false
    } as unknown as NetworkHealthConfig
    const { result } = renderHook(() => stagesFromConfig(config)
      .map((set:{ key: string, title: MessageDescriptor }) => ({
        ...set, title: useIntl().$t(set.title) })))
    expect(result.current).toEqual([
      { key: 'auth', title: '802.11 Auth' },
      { key: 'assoc', title: 'Association' },
      { key: 'dhcp', title: 'DHCP' },
      { key: 'dns', title: 'DNS' }
    ])
  })

  it('returns nothing when config is empty', () => {
    expect(stagesFromConfig({} as NetworkHealthConfig)).toEqual([])
  })

  it('is a pure function', () => {
    const config = {
      ...fetchServiceGuardTest.serviceGuardTest.config,
      authenticationMethod: AuthenticationMethod.OPEN_AUTH,
      pingAddress: 'google.com',
      tracerouteAddress: null,
      speedTestEnabled: false
    } as unknown as NetworkHealthConfig
    const { result: { current: stages } } = renderHook(() => stagesFromConfig(config)
      .map((set:{ key: string, title: MessageDescriptor }) => ({
        ...set, title: useIntl().$t(set.title) })))
    stages[0].key = 'speedTest'
    const { result: newResult } = renderHook(() => stagesFromConfig(config)
      .map((set:{ key: string, title: MessageDescriptor }) => ({
        ...set, title: useIntl().$t(set.title) })))
    expect(newResult.current).toEqual([
      { key: 'auth', title: '802.11 Auth' },
      { key: 'assoc', title: 'Association' },
      { key: 'dhcp', title: 'DHCP' },
      { key: 'dns', title: 'DNS' },
      { key: 'ping', title: 'Ping' }
    ])
  })
})

describe('statsFromSummary', () => {
  it('should return correct data', () => {
    expect(statsFromSummary({} as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: undefined,
      apsUnderTest: undefined,
      isOngoing: false,
      lastResult: undefined
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 2,
      apsSuccessCount: 0
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: 0,
      apsUnderTest: 2,
      isOngoing: true,
      lastResult: 0
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 1
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: 2,
      apsUnderTest: 2,
      isOngoing: false,
      lastResult: 0.5
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 2
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      apsFinishedTest: 2,
      apsUnderTest: 2,
      isOngoing: false,
      lastResult: 1
    })
  })
})

describe('formatApsUnderTest', () => {
  it('should return correct value - pass', ()=>{
    const { result } = renderHook(() => formatApsUnderTest(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 2
    } as NetworkHealthTest['summary']) as StatsFromSummary, useIntl().$t))
    expect(result.current).toEqual('2 APs')
  })
  it('should return correct value - ongoing test', ()=>{
    const { result } = renderHook(() => formatApsUnderTest(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 2,
      apsSuccessCount: 0
    } as NetworkHealthTest['summary']) as StatsFromSummary, useIntl().$t))
    expect(result.current).toEqual('0 of 2 APs tested')
  })
  it('should return correct value - no data test', ()=>{
    const { result } = renderHook(() => formatApsUnderTest(
      statsFromSummary({} as NetworkHealthTest['summary']) as StatsFromSummary, useIntl().$t))
    expect(result.current).toEqual('-')
  })
})

describe('formatLastResult', () => {
  it('should return correct value - pass', ()=>{
    const { result } = renderHook(() => formatLastResult(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 2
    } as NetworkHealthTest['summary']) as StatsFromSummary, useIntl().$t))
    expect(result.current).toEqual('100% pass')
  })
  it('should return correct value - ongoing test', ()=>{
    const { result } = renderHook(() => formatLastResult(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 2,
      apsSuccessCount: 0
    } as NetworkHealthTest['summary']) as StatsFromSummary, useIntl().$t))
    expect(result.current).toEqual('In progress...')
  })
  it('should return correct value - no data test', ()=>{
    const { result } = renderHook(() => formatLastResult(
      statsFromSummary({} as NetworkHealthTest['summary']) as StatsFromSummary, useIntl().$t))
    expect(result.current).toEqual('-')
  })
})