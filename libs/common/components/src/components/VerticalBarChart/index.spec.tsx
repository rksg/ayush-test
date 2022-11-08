import React, { RefObject } from 'react'

import { ECharts }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { render, screen, renderHook } from '@acx-ui/test-utils'

import { data } from './stories'

import { VerticalBarChart, tooltipFormatter, useOnBarAreaClick } from '.'

import type { TooltipComponentFormatterCallbackParams } from 'echarts'

describe('VerticalBarChart',()=>{
  it('should render correctly', () => {
    const { asFragment } = render(<VerticalBarChart data={data} />)
    expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(screen.queryByText('VerticalBarChartTest')).toBeNull()
  })

  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<VerticalBarChart
      data={data}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })

  it('should render with title', () => {
    render(<VerticalBarChart
      data={data}
      xAxisName={'VerticalBarChart x-axis name'}
    />)
    expect(screen.getAllByText('VerticalBarChart x-axis name')).toHaveLength(1)
  })

  describe('tooltipFormatter', () => {
    it('should return correct Html string', async () => {
      const params = [{
        data: ['-75', 1100],
        dimensionNames: ['RSS', 'Samples']
      }] as unknown as TooltipComponentFormatterCallbackParams
      const formatter = jest.fn(value=>`formatted-${value}`)
      expect(tooltipFormatter(formatter, true)(params))
        .toMatchSnapshot()
      expect(formatter).toBeCalledTimes(1)
    })

    it('should return correct Html when showTooltipName is false', async () => {
      const params = [{
        data: ['-75', 1100],
        dimensionNames: ['RSS', 'Samples']
      }] as unknown as TooltipComponentFormatterCallbackParams
      const formatter = jest.fn(value=>`formatted-${value}`)
      expect(tooltipFormatter(formatter, false)(params).match(/Samples/)).toBeNull()
    })
  })
  let eChartsRef: RefObject<ReactECharts>
  describe('useOnBarAreaClick', () => {
    it('handles null echart ref', () => {
      eChartsRef = { current: null } as RefObject<ReactECharts>
      renderHook(() => useOnBarAreaClick(eChartsRef, jest.fn()))
      // intentionally no assertion to cover the line where echart ref is null
    })

    it('handles mark area events', async () => {
      const mockSetCursorStyle = jest.fn()
      const mockOnBarAreaClick = jest.fn()
      const callbacks: Record<string, (event: unknown) => void> = {}
      const mockOn = jest.fn().mockImplementation((
        type: string,
        _1: string,
        callback: ((event: unknown) => void)
      ) => callbacks[type] = callback)
      eChartsRef = {
        current: {
          getEchartsInstance: () => ({
            on: mockOn,
            getZr: () => ({ setCursorStyle: mockSetCursorStyle })
          } as unknown as ECharts)
        }
      } as RefObject<ReactECharts>

      renderHook(() => useOnBarAreaClick(
        eChartsRef,
        mockOnBarAreaClick
      ))

      expect(mockOn).toBeCalledWith('mousemove', 'series.bar', expect.any(Function))
      expect(mockOn).toBeCalledWith('click', 'series.bar', expect.any(Function))
      expect(Object.keys(callbacks)).toHaveLength(2)

      callbacks['mousemove']('unused')
      expect(mockSetCursorStyle).toBeCalledWith('pointer')

      const data = [1,2]
      callbacks['click']({ data: [1,2] })
      expect(mockOnBarAreaClick).toBeCalledWith(data)
    })
  })
})
