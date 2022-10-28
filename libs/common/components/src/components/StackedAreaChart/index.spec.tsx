import React, { RefObject } from 'react'

import ReactECharts from 'echarts-for-react'

import { TimeSeriesChartData }     from '@acx-ui/analytics/utils'
import { render, waitFor, screen } from '@acx-ui/test-utils'

import { cssStr } from '../../theme/helper'

import { data } from './stories'

import { StackedAreaChart, getSeriesTotal } from '.'

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

describe('StackedAreaChart',() => {
  it('should render StackedAreaChart', () => {
    const { asFragment } = render(<StackedAreaChart data={data} />)
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector('svg')).toBeDefined()
  })
  it('should use imperative handle', async () => {
    const mockCallbackRef = jest.fn()
    let createHandleCallback: () => RefObject<ReactECharts>
    jest.spyOn(React, 'useImperativeHandle').mockImplementation((ref, callback) => {
      expect(ref).toEqual(mockCallbackRef)
      createHandleCallback = callback as () => RefObject<ReactECharts>
    })
    render(<StackedAreaChart
      data={data}
      chartRef={mockCallbackRef}
    />)
    await waitFor(() => {
      expect(createHandleCallback()).not.toBeNull()
    })
    jest.restoreAllMocks()
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
    expect(asFragment().querySelector(`path[stroke="${cssStr('--acx-viz-qualitative-1')}"]`))
      .not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[stroke="${cssStr('--acx-viz-qualitative-2')}"]`))
      .not.toBeNull()
    // eslint-disable-next-line testing-library/no-node-access
    expect(asFragment().querySelector(`path[stroke="${cssStr('--acx-viz-qualitative-3')}"]`))
      .toBeNull()
  })

  it('should not render legend if disabled', () => {
    render(<StackedAreaChart
      data={data}
      disableLegend
    />)
    expect(screen.queryByText('2.4 GHz')).toBeNull()
  })

  it('should render reset button after zoom', async () => {
    const mockSetCanResetZoom = jest.fn()
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation(() => [true, mockSetCanResetZoom])
    render(<StackedAreaChart
      data={data}
    />)
    expect(screen.getByRole('button', { name: 'Reset Zoom' })).toBeVisible()
  })
})
