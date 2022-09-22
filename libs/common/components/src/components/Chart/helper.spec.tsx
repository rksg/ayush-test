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
    expect(dateAxisFormatter())
      .toEqual({
        day: '{MMM} {dd}',
        hour: '{HH} {mm}',
        month: '{MMM}',
        year: '{yyyy}'
      })
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
    name: 'name', color: 'color1', value: 10
  } as TooltipFormatterParams
  it('should return correct Html string for single value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(renderHook(() => donutChartTooltipFormatter(
      useIntl(),
      formatter,
      100
    )(singleparameters)).result.current).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(2)
  })
  it('should handle custom format', async () => {
    const format = defineMessage({
      defaultMessage: `{name}
        <br></br>
        <b>{formattedValue} {value, plural, one {unit} other {units} }</b>
        ({formattedPercent})
        <span>{formattedTotal}</span>
        <div>{percent} {total}</div>
      `
    })
    const formatter = jest.fn(value => `formatted-${value}`)
    expect(renderHook(() => donutChartTooltipFormatter(
      useIntl(),
      formatter,
      100,
      format
    )({ ...singleparameters, percent: 10 })).result.current).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(2)
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
