import { TimeSeriesChartData } from '@acx-ui/analytics/utils'
import { TimeStamp }           from '@acx-ui/types'

import {
  dataZoomOptions,
  dateAxisFormatter,
  timeSeriesTooltipFormatter,
  getDeviceConnectionStatusColors,
  handleSingleBinData,
  getDeviceConnectionStatusColorsv2
} from './helper'

import type { TooltipFormatterParams } from './helper'

describe('dataZoomOptions', () => {
  it('should return correct dataZoom options', () => {
    const data = [
      {
        key: 'series1',
        name: 'series1',
        data: [['2022-04-07T09:15:00.000Z', 1], ['2022-04-07T09:30:00.000Z', 2]]
      },
      {
        key: 'series2',
        name: 'series2',
        data: [['2022-04-07T09:15:00.000Z', 3], ['2022-04-07T09:45:00.000Z', 4]]
      }
    ] as TimeSeriesChartData[]
    expect(dataZoomOptions(data)).toEqual([{
      id: 'zoom',
      type: 'inside',
      filterMode: 'none',
      zoomLock: true,
      minValueSpan: 30 * 60 * 1000
    }])
  })
})

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

describe('handleSingleBinData', () => {
  it('should replace the null data before/after single bin data to be 0', () => {
    const data = [
      ['2022-04-07T09:15:00.000Z', null],
      ['2022-04-07T09:30:00.000Z', null],
      ['2022-04-07T09:45:00.000Z', 10],
      ['2022-04-07T10:00:00.000Z', null],
      ['2022-04-07T10:15:00.000Z', 10],
      ['2022-04-07T10:30:00.000Z', 10],
      ['2022-04-07T10:45:00.000Z', null],
      ['2022-04-07T11:00:00.000Z', 10],
      ['2022-04-07T11:15:00.000Z', 10],
      ['2022-04-07T11:30:00.000Z', null]
    ] as TimeSeriesChartData['data']
    expect(handleSingleBinData(data)).toEqual([
      ['2022-04-07T09:15:00.000Z', null],
      ['2022-04-07T09:30:00.000Z', 0],
      ['2022-04-07T09:45:00.000Z', 10],
      ['2022-04-07T10:00:00.000Z', 0],
      ['2022-04-07T10:15:00.000Z', 10],
      ['2022-04-07T10:30:00.000Z', 10],
      ['2022-04-07T10:45:00.000Z', null],
      ['2022-04-07T11:00:00.000Z', 10],
      ['2022-04-07T11:15:00.000Z', 10],
      ['2022-04-07T11:30:00.000Z', null]
    ])
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
    const result = timeSeriesTooltipFormatter(singleSeries, dataFormatters)(singleparameters)
    expect(result).toMatchSnapshot()
    expect(dataFormatters.default).toBeCalledTimes(1)
  })
  it('should return correct Html string for multiple value', async () => {
    const dataFormatters = { default: jest.fn((value) => `formatted-${value}`) }
    const result = timeSeriesTooltipFormatter(multiSeries, dataFormatters)(multiParameters)
    expect(result).toMatchSnapshot()
    expect(dataFormatters.default).toBeCalledTimes(multiSeries.length)
  })
  it('should hide row when legend deselected', async () => {
    const dataFormatters = { default: jest.fn((value) => `formatted-${value}`) }
    const result = timeSeriesTooltipFormatter(multiSeries, dataFormatters)(singleparameters)
    expect(result).toMatchSnapshot()
    expect(dataFormatters.default).toBeCalledTimes(1)
  })
  it('should hide badge when show is false (only show in tooltip not in chart)', async () => {
    const dataFormatters = { default: jest.fn((value) => `formatted-${value}`) }
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
    const result = timeSeriesTooltipFormatter(noBadgeSeries, dataFormatters)(singleparameters)
    expect(result).toMatchSnapshot()
  })
  it('accept custom formatter which includes index in param', () => {
    const dataFormatters = { default: jest.fn((value, tz, index) => `formatted-${value}-${index}`) }
    const result = timeSeriesTooltipFormatter(multiSeries, dataFormatters)(multiParameters)
    expect(result).toMatchSnapshot()
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

describe('getDeviceConnectionStatusColorsv2', () => {
  it('should return the correct color for the device status', ()=>{
    expect(getDeviceConnectionStatusColorsv2())
      .toStrictEqual([
        '#23AB36',
        '#F9C34B',
        '#ED1C24',
        '#ACAEB0'])
  })
})
