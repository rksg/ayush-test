import { render } from '@testing-library/react'

import { TimeSeriesChartData } from '@acx-ui/analytics/utils'

import { cssStr } from '../../theme/helper'

import { data } from './stories'

import { StackedAreaChart, StepStackedAreaChart, getSeriesTotal } from '.'

describe('getSeriesTotal',() => {
  it('should return correct total series', () => {
    const series = [{
      key: 'series1',
      name: 'Series 1',
      data: [
        [1603929600000, 1], [1604016000000, '-'], [1604102400000, 5]
      ]
    }, {
      key: 'series2',
      name: 'Series 2',
      data: [
        [1603929600000, 2], [1604016000000, '-'], [1604102400000, 6]
      ]
    }] as TimeSeriesChartData[]
    expect(getSeriesTotal(series, 'Total')).toEqual({
      key: 'total',
      name: 'Total',
      show: false,
      data: [
        [1603929600000, 3], [1604016000000, 0], [1604102400000, 11]
      ]
    })
  })
})

describe('StackedAreaChart', () => {
  it('should render StackedAreaChart', () => {
    const { asFragment } = render(<StackedAreaChart data={data} />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<StackedAreaChart
      data={data}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })
  it('should not show total series in chart', () => {
    const formatter = jest.fn()
    const { asFragment } = render(<StackedAreaChart
      data={data}
      dataFormatter={formatter}
      tooltipTotalTitle={'total'}
    />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[stroke="${cssStr('--acx-accents-blue-30')}"]`))
      .not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[stroke="${cssStr('--acx-accents-blue-70')}"]`))
      .not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[stroke="${cssStr('--acx-accents-blue-50')}"]`))
      .toBeNull()
  })
})

describe('StepStackedAreaChart',() => {
  it('should render StackedAreaChart', () => {
    const { asFragment } = render(<StepStackedAreaChart data={data} />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
})
