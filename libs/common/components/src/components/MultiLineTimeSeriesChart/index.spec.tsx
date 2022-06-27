import { render } from '@testing-library/react'
import moment     from 'moment-timezone'

import { getSeriesData } from './stories'

import { tooltipFormatter, MultiLineTimeSeriesChart } from '.'

import type { TooltipFormatterParams } from '.'

describe('tooltipFormatter',()=>{
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
    expect(tooltipFormatter(formatter)(singleparameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(1)
  })
  it('should return correct Html string for multiple value', async () => {
    const formatter = jest.fn(value=>`formatted-${value}`)
    expect(tooltipFormatter(formatter)(multiParameters)).toMatchSnapshot()
    expect(formatter).toBeCalledTimes(multiParameters.length)
  })
  it('should handle when no formatter', async () => {
    expect(tooltipFormatter()(singleparameters)).toMatchSnapshot()
    expect(tooltipFormatter()(multiParameters)).toMatchSnapshot()
  })
})

describe('MultiLineTimeSeriesChart',()=>{
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })
})
