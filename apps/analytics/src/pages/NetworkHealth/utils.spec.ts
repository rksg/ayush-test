import _           from 'lodash'
import { useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { NetworkHealthTest }                                                                       from './types'
import { statsFromSummary, formatApsUnderTest, formatLastResult, StatsFromSummary, getTestStatus } from './utils'

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

describe('getTestStatus', () => {
  it('should return correct data', () => {
    expect(_.omit(getTestStatus({
      summary: { apsTestedCount: 2, apsSuccessCount: 2, apsPendingCount: 0 }
    } as NetworkHealthTest),'summary')).toEqual({
      apsFinishedTest: 2,
      apsUnderTest: 2,
      lastResult: 1
    })
    expect(_.omit(getTestStatus({
      summary: { apsTestedCount: 2, apsSuccessCount: 0, apsPendingCount: 2 }
    } as NetworkHealthTest),'summary')).toEqual({
      isOngoing: true,
      apsFinishedTest: 0,
      apsUnderTest: 2,
      lastResult: 0
    })
    expect(_.omit(getTestStatus({
      summary: { apsTestedCount: 2, apsSuccessCount: 1, apsPendingCount: 1 }
    } as NetworkHealthTest),'summary')).toEqual({
      isOngoing: true,
      apsFinishedTest: 1,
      apsUnderTest: 2,
      lastResult: 0.5
    })
  })
})