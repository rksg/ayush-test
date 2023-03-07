import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { NetworkHealthTest, TestType, Schedule, ScheduleFrequency } from './types'
import {
  statsFromSummary,
  formatApsUnderTest,
  formatLastResult,
  formatTestType
} from './utils'

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

describe('formatTestType', () => {
  it('should format for on-demand', () => {
    expect(formatTestType(TestType.OnDemand, null)).toEqual('On-Demand')
  })

  it('should format for scheduled', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(Date.parse('2023-03-01')))
    const schedule = {
      type: 'service_guard' as Schedule['type'],
      frequency: ScheduleFrequency.Daily,
      day: null,
      hour: 4.25,
      timezone: 'Europe/London',
      nextExecutionTime: '2023-03-06T00:00:00.000Z'
    }
    render(formatTestType(TestType.Scheduled, schedule) as React.ReactElement)
    const node = screen.getByText('Scheduled (in 5 days)')
    expect(node).toBeVisible()
    userEvent.hover(node)
    expect(await screen.findByText('03/06/2023 00:00')).toBeInTheDocument()
    jest.useRealTimers()
  })
})
