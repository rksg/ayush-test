import React, { RefObject } from 'react'

import { ECharts }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { mockDOMWidth, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { getSeriesData } from './stories'

import {
  useBrush,
  useOnMarkedAreaClick,
  MultiLineTimeSeriesChart
} from '.'

describe('MultiLineTimeSeriesChart', () => {
  mockDOMWidth()

  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })

  it('should not render legend if disabled', () => {
    render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      disableLegend
    />)
    expect(screen.queryByText('New Clients')).toBeNull()
  })

  it('should render brush if enabled', async () => {
    const { asFragment } = render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      brush={['2022-09-07', '2022-09-07']}
    />)
    await waitFor(() => {
      expect(asFragment().querySelector('path[stroke="#123456"]')).not.toBeNull()
    })
  })

  it('should render reset button after zoom', async () => {
    const mockSetCanResetZoom = jest.fn()
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation(() => [true, mockSetCanResetZoom])
    render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      brush={['2022-09-07', '2022-09-07']}
    />)
    expect(screen.getByRole('button', { name: 'Reset Zoom' })).toBeVisible()
  })
})

type DispatchAction = ((payload: unknown, opt?: boolean | {
  silent?: boolean;
  flush?: boolean | undefined;
}) => void)
let mockDispatchActionFn: DispatchAction
let eChartsRef: RefObject<ReactECharts>

describe('useBrush', () => {
  beforeEach(() => {
    mockDispatchActionFn = jest.fn() as DispatchAction
    eChartsRef = {
      current: { getEchartsInstance: () => ({ dispatchAction: mockDispatchActionFn }) }
    } as RefObject<ReactECharts>
  })

  it('handles null echart ref', () => {
    eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => useBrush(eChartsRef, getSeriesData(), ['2022-09-07', '2022-09-07']))
  })

  it('handles undefined brush props', () => {
    renderHook(() => useBrush(eChartsRef, getSeriesData(), undefined))
    expect(eChartsRef.current?.getEchartsInstance().dispatchAction).not.toBeCalled()
  })

  it('dispatches action for brush', () => {
    renderHook(() => useBrush(eChartsRef, getSeriesData(), ['2022-09-07', '2022-09-07']))
    expect(mockDispatchActionFn).toBeCalledTimes(1)
    expect(mockDispatchActionFn).toBeCalledWith({
      type: 'brush',
      areas: [{ brushType: 'lineX', coordRange: ['2022-09-07', '2022-09-07'], xAxisIndex: 0 }]
    })
  })

  it('returns onBrushendCallback and calls onBrushChange', () => {
    const mockOnBrushChange = jest.fn()
    renderHook(() => {
      const onBrushendCallback = useBrush(
        eChartsRef,
        getSeriesData(),
        ['2022-09-07', '2022-09-07'],
        mockOnBrushChange
      )
      onBrushendCallback({ areas: [{ coordRange: ['2022-09-07', '2022-09-07'] }] })
    })
    expect(mockOnBrushChange).toBeCalledTimes(1)
    expect(mockOnBrushChange).toBeCalledWith(['2022-09-07', '2022-09-07'])
  })
})

describe('useOnMarkedAreaClick', () => {
  it('handles null echart ref', () => {
    const eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => useOnMarkedAreaClick(eChartsRef, jest.fn()))

    // intentionally left blank to cover the line where echart ref is null
  })

  it('handles marked area click', async () => {
    const callbacks: Array<(params: unknown) => void> = []
    const on = jest.fn().mockImplementation((
      _0: string,
      _1: string,
      callback: ((params: unknown) => void)
    ) => callbacks.push(callback))

    const instance = { on } as unknown as ECharts
    const onClick = jest.fn()

    renderHook(() => useOnMarkedAreaClick(
      { current: { getEchartsInstance: () => instance } } as RefObject<ReactECharts>,
      onClick
    ))

    expect(on).toBeCalledWith('click', 'series.line', expect.any(Function))
    expect(callbacks).toHaveLength(1)

    const data = { a: '1', b: '2' }
    callbacks[0]({ data: { data } })

    expect(onClick).toBeCalledWith(data)
  })
})
