import { CallbackDataParams }     from 'echarts/types/dist/shared'
import { defineMessage, useIntl } from 'react-intl'

import { TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { renderHook }          from '@acx-ui/test-utils'
import { TimeStamp }           from '@acx-ui/types'

import {
  dateAxisFormatter,
  timeSeriesTooltipFormatter,
  stackedBarTooltipFormatter,
  donutChartTooltipFormatter,
  getDeviceConnectionStatusColors,
  getTimeSeriesSymbol
} from './helper'

import type { TooltipFormatterParams } from './helper'

describe('dateAxisFormatter', () => {
  it('formats date time correctly', () => {
    expect(dateAxisFormatter())
      .toEqual({
        day: '{MMM} {dd}',
        hour: '{HH}:{mm}',
        month: '{MMM}',
        year: '{yyyy}'
      })
  })
})

describe('getTimeSeriesSymbol', () => {
  it('should return none for symbol', () => {
    const series = [{
      key: 'series1',
      name: 'series1',
      data: [
        ['2022-04-07T09:15:00.000Z', 1],
        ['2022-04-07T09:30:00.000Z', 2],
        ['2022-04-07T09:45:00.000Z', 3],
        ['2022-04-07T10:00:00.000Z', 4],
        ['2022-04-07T10:15:00.000Z', 5]
      ] as TimeSeriesChartData['data']
    }]
    expect(
      getTimeSeriesSymbol(series)([], { seriesIndex: 0, dataIndex: 2 } as CallbackDataParams)
    ).toEqual('none')
  })
  it('should return circle for symbol when single data point', () => {
    const series = [{
      key: 'series1',
      name: 'series1',
      data: [
        ['2022-04-07T09:15:00.000Z', '-'],
        ['2022-04-07T09:30:00.000Z', '-'],
        ['2022-04-07T09:45:00.000Z', 3],
        ['2022-04-07T10:00:00.000Z', '-'],
        ['2022-04-07T10:15:00.000Z', '-']
      ] as TimeSeriesChartData['data']
    }]
    expect(
      getTimeSeriesSymbol(series)([], { seriesIndex: 0, dataIndex: 2 } as CallbackDataParams)
    ).toEqual('circle')
  })
})

describe('timeSeriesTooltipFormatter', () => {
  const singleSeries = [{
    key: 'key1',
    name: 'seriesName1',
    data: [[1605628800000, 518] as [TimeStamp, number]]
  }]
  const multiSeries = [
    ...singleSeries, {
      key: 'key2',
      name: 'seriesName2',
      data: [[1605628800000, 1416] as [TimeStamp, number]]
    }, {
      key: 'key3',
      name: 'seriesName3',
      data: [[1605628800000, 2672] as [TimeStamp, number]]
    }
  ]
  const singleparameters = {
    data: [1605628800000, 518], color: 'color1', seriesName: 'seriesName1', dataIndex: 0
  } as TooltipFormatterParams
  const multiParameters = [
    singleparameters,
    { data: [1605628800000, 1416], color: 'color2', seriesName: 'seriesName2', dataIndex: 0 },
    { data: [1605628800000, 2672], color: 'color3', seriesName: 'seriesName3', dataIndex: 0 }
  ] as TooltipFormatterParams[]

  it('should return correct Html string for single value', async () => {
    const dataFormatters = { default: jest.fn((value) => `formatted-${value}`) }
    expect(timeSeriesTooltipFormatter(singleSeries, dataFormatters)(singleparameters))
      .toMatchSnapshot()
    expect(dataFormatters.default).toBeCalledTimes(1)
  })
  it('should return correct Html string for multiple value', async () => {
    const dataFormatters = { default: jest.fn((value) => `formatted-${value}`) }
    expect(timeSeriesTooltipFormatter(multiSeries, dataFormatters)(multiParameters))
      .toMatchSnapshot()
    expect(dataFormatters.default).toBeCalledTimes(multiParameters.length)
  })
  it('should handle when no formatter', async () => {
    expect(timeSeriesTooltipFormatter(singleSeries, {})(singleparameters)).toMatchSnapshot()
    expect(timeSeriesTooltipFormatter(multiSeries, {})(multiParameters)).toMatchSnapshot()
  })
  it('should hide row when legend deselected', async () => {
    expect(timeSeriesTooltipFormatter(multiSeries, {})(singleparameters)).toMatchSnapshot()
  })
  it('should hide badge when show is false (only show in tooltip not in chart)', async () => {
    const noBadgeSeries = [
      ...singleSeries, {
        key: 'key2',
        name: 'seriesName2',
        show: false,
        data: [[1605628800000, 1416] as [TimeStamp, number]]
      }, {
        key: 'key3',
        name: 'seriesName3',
        show: false,
        data: [[1605628800000, 2672] as [TimeStamp, number]]
      }
    ]
    expect(timeSeriesTooltipFormatter(noBadgeSeries, {})(singleparameters)).toMatchSnapshot()
  })
})

describe('stackedBarTooltipFormatter', () => {
  const singleparameters = {
    color: 'color1', value: [10]
  } as TooltipFormatterParams
  it('should return correct Html string for single value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(stackedBarTooltipFormatter(formatter)(singleparameters))
      .toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should handle custom format', async () => {
    const format = defineMessage({
      defaultMessage: `<span>{name}</span>
        <br></br>
        <space>
          <b>{formattedValue} {value, plural, one {unit} other {units} }</b>
        </space>
      `
    })
    const formatter = jest.fn(value => `formatted-${value}`)
    expect(stackedBarTooltipFormatter(
      formatter,
      format
    )({ ...singleparameters, percent: 10 })).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should handle when dataFormatter is null', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(stackedBarTooltipFormatter()(singleparameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(0)
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
