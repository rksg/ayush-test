import { defineMessage, useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import {
  dateAxisFormatter,
  timeSeriesTooltipFormatter,
  stackedBarTooltipFormatter,
  donutChartTooltipFormatter,
  getDeviceConnectionStatusColors
} from './helper'

import type { TooltipFormatterParams } from './helper'

describe('dateAxisFormatter', () => {
  it('formats date time correctly', () => {
    expect(dateAxisFormatter((new Date('2020-01-01T00:00+00:00')).valueOf()))
      .toEqual('2020')
    expect(dateAxisFormatter((new Date('2020-02-01T00:00+00:00')).valueOf()))
      .toEqual('Feb')
    expect(dateAxisFormatter((new Date('2020-02-03T00:00+00:00')).valueOf()))
      .toEqual('Feb 03')
    expect(dateAxisFormatter((new Date('2020-02-03T07:00+00:00')).valueOf()))
      .toEqual('Feb 03 07:00')
  })
})

describe('timeSeriesTooltipFormatter', () => {
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
  it('should handle unit', async () => {
    const unit = defineMessage({ defaultMessage: `{formattedCount} {count, plural,
      one {unit}
      other {units}
    }` })
    const formatter = jest.fn(value => `formatted-${value}`)
    expect(renderHook(()=>donutChartTooltipFormatter(
      formatter, unit, useIntl())(singleparameters)).result.current).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
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
