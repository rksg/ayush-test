import moment from 'moment-timezone'

import { mockLightTheme } from '@acx-ui/test-utils'

import {
  timeSeriesTooltipFormatter,
  stackedBarTooltipFormatter,
  donutChartTooltipFormatter,
  getDeviceConnectionStatusColors
} from './helper'

import type { TooltipFormatterParams } from './helper'

jest.mock('../../theme/helper', () => ({
  __esModule: true,
  cssStr: jest.fn(property => mockLightTheme[property]),
  deviceStatusColors: {
    CONNECTED: '--acx-semantics-green-50',
    INITIAL: '--acx-neutrals-50',
    ALERTING: '--acx-semantics-yellow-40',
    DISCONNECTED: '--acx-semantics-red-50'
  }
}))

describe('timeSeriesTooltipFormatter',()=>{
  const timezone = 'UTC'
  beforeEach(() => {
    moment.tz.setDefault(timezone)
  })
  afterEach(() => {
    moment.tz.setDefault(moment.tz.guess())
  })
  const singleparameters = {
    data: [1605628800000, 518], color: 'color1', seriesName: 'seriesName1'
  } as TooltipFormatterParams
  const multiParameters = [
    singleparameters,
    { data: [1605628800000, 1416], color: 'color2', seriesName: 'seriesName2' },
    { data: [1605628800000, 2672], color: 'color3', seriesName: 'seriesName3' }
  ] as TooltipFormatterParams[]

  it('should return correct Html string for single value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(timeSeriesTooltipFormatter(formatter)(singleparameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should return correct Html string for multiple value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(timeSeriesTooltipFormatter(formatter)(multiParameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(multiParameters.length)
  })
  it('should handle when no formatter', async () => {
    expect(timeSeriesTooltipFormatter()(singleparameters)).toMatchSnapshot()
    expect(timeSeriesTooltipFormatter()(multiParameters)).toMatchSnapshot()
  })
})

describe('stackedBarTooltipFormatter', () => {
  const singleparameters = {
    color: 'color1', value: [10]
  } as TooltipFormatterParams
  it('should return correct Html string for single value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(stackedBarTooltipFormatter(formatter)(singleparameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should handle when no formatter', async () => {
    expect(stackedBarTooltipFormatter()(singleparameters)).toMatchSnapshot()
  })
})

describe('donutChartTooltipFormatter', () => {
  const singleparameters = {
    color: 'color1', value: 10
  } as TooltipFormatterParams
  it('should return correct Html string for single value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(donutChartTooltipFormatter(formatter)(singleparameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should handle when no formatter', async () => {
    expect(donutChartTooltipFormatter()(singleparameters)).toMatchSnapshot()
  })
})

describe('getDeviceConnectionStatusColors', () => {
  it('should return the correct color for the device status', ()=>{
    expect(getDeviceConnectionStatusColors())
      .toStrictEqual([
        '#23AB36',
        '#ACAEB0',
        '#F9C34B',
        '#ED1C24'])
  })
})
