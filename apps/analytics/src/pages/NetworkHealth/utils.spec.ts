import { NetworkHealthTest }                                      from './types'
import { statsFromSummary, formatApsUnderTest, formatLastResult } from './utils'

describe('statsFromSummary', () => {
  it('should return correct data', () => {
    expect(statsFromSummary(undefined)).toEqual({
      isOngoing: false,
      apsFinishedTest: undefined,
      apsUnderTest: undefined,
      lastResult: undefined
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 2,
      apsSuccessCount: 0
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      isOngoing: true,
      apsFinishedTest: 0,
      apsUnderTest: 2,
      lastResult: 0
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 1
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      isOngoing: false,
      apsFinishedTest: 2,
      apsUnderTest: 2,
      lastResult: 0.5
    })
    expect(statsFromSummary({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 2
    } as unknown as NetworkHealthTest['summary'])).toEqual({
      isOngoing: false,
      apsFinishedTest: 2,
      apsUnderTest: 2,
      lastResult: 1
    })
  })
})

describe('formatApsUnderTest', () => {
  it('should return correct value - pass', ()=>{
    const result = formatApsUnderTest({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 2
    })
    expect(result).toEqual('2')
  })
  it('should return correct value - ongoing test', ()=>{
    const result = formatApsUnderTest({
      apsTestedCount: 2,
      apsPendingCount: 1,
      apsSuccessCount: 0
    })
    expect(result).toEqual('1 of 2 APs tested')
  })
  it('should return correct value - ongoing test 1 AP', ()=>{
    const result = formatApsUnderTest({
      apsTestedCount: 1,
      apsPendingCount: 1,
      apsSuccessCount: 0
    })
    expect(result).toEqual('0 of 1 AP tested')
  })
  it('should return correct value - no data test', ()=>{
    const result = formatApsUnderTest(undefined)
    expect(result).toEqual('-')
  })
})

describe('formatLastResult', () => {
  it('should return correct value - pass', ()=>{
    const result = formatLastResult({
      apsTestedCount: 2,
      apsPendingCount: 0,
      apsSuccessCount: 2
    })
    expect(result).toEqual('100% pass')
  })
  it('should return correct value - ongoing test', ()=>{
    const result = formatLastResult({
      apsTestedCount: 2,
      apsPendingCount: 2,
      apsSuccessCount: 0
    })
    expect(result).toEqual('In progress...')
  })
  it('should return correct value - no data test', ()=>{
    const result = formatLastResult(undefined)
    expect(result).toEqual('-')
  })
})
