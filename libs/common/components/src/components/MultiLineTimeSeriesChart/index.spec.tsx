import React, { RefObject } from 'react'

import { ECharts }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { mockDOMWidth, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { getSeriesData } from './stories'

import {
  useBrush,
  useOnMarkAreaClick,
  MultiLineTimeSeriesChart
} from '.'

const markers = [{
  startTime: +new Date('2020-11-01T00:00:00.000Z'),
  endTime: +new Date('2020-11-05T00:00:00.000Z'),
  data: { id: 1 },
  itemStyle: { opacity: 0.3, color: '#FF00FF' }
}]

describe('MultiLineTimeSeriesChart', () => {
  mockDOMWidth()

  it('should use imperative handle', async () => {
    const mockCallbackRef = jest.fn()
    let createHandleCallback: () => RefObject<ReactECharts>
    jest.spyOn(React, 'useImperativeHandle').mockImplementation((ref, callback) => {
      expect(ref).toEqual(mockCallbackRef)
      createHandleCallback = callback as () => RefObject<ReactECharts>
    })
    render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      chartRef={mockCallbackRef}
    />)
    await waitFor(() => {
      expect(createHandleCallback()).not.toBeNull()
    })
    jest.restoreAllMocks()
  })

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

  it('should render mark area if enabled', async () => {
    const { asFragment } = render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      markers={markers}
    />)
    await waitFor(() => {
      const markAreaPaths = asFragment().querySelectorAll('path[fill="#FF00FF"]')
      expect(markAreaPaths.length).toEqual(1)
    })
  })
})

type DispatchAction = ((payload: unknown, opt?: boolean | {
  silent?: boolean;
  flush?: boolean | undefined;
}) => void)
let mockDispatchActionFn: DispatchAction
let eChartsRef: RefObject<ReactECharts>

describe('useBrush', () => {
  let callbacks: Record<string, (event: unknown) => void>
  let mockGetZrOn: (type: string, callback: ((event: unknown) => void)) => void
  let mockSetCursorStyle: (style: string) => void

  beforeEach(() => {
    mockDispatchActionFn = jest.fn() as DispatchAction
    callbacks = {}
    mockGetZrOn = jest.fn().mockImplementation((type, callback) => callbacks[type] = callback)
    mockSetCursorStyle = jest.fn()
    eChartsRef = {
      current: {
        getEchartsInstance: () => ({
          dispatchAction: mockDispatchActionFn,
          getZr: () => ({
            on: mockGetZrOn,
            setCursorStyle: mockSetCursorStyle
          })
        })
      }
    } as RefObject<ReactECharts>
  })

  it('handles null echart ref', () => {
    eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => useBrush(eChartsRef, getSeriesData(), ['2022-09-07', '2022-09-07']))
    // intentionally no assertion to cover the line where echart ref is null
  })

  it('handles undefined brush props', () => {
    renderHook(() => useBrush(eChartsRef, getSeriesData(), undefined))
    expect(mockDispatchActionFn).not.toBeCalled()
  })

  it('handles brush events', () => {
    renderHook(() => useBrush(eChartsRef, getSeriesData(), ['2022-09-07', '2022-09-07']))

    expect(mockDispatchActionFn).toBeCalledTimes(1)
    expect(mockDispatchActionFn).toBeCalledWith({
      type: 'brush',
      areas: [{ brushType: 'lineX', coordRange: ['2022-09-07', '2022-09-07'], xAxisIndex: 0 }]
    })
    expect(mockGetZrOn).toBeCalledWith('mousemove', expect.any(Function))
    expect(Object.keys(callbacks)).toHaveLength(1)

    callbacks['mousemove']({ target: { type: 'anything' } })
    callbacks['mousemove']({ target: { type: 'ec-polyline' } })
    expect(mockSetCursorStyle).toBeCalledWith('default')
    expect(mockSetCursorStyle).toBeCalledTimes(1)
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

describe('useOnMarkAreaClick', () => {
  it('handles null echart ref', () => {
    eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => useOnMarkAreaClick(eChartsRef, markers, jest.fn()))
    // intentionally no assertion to cover the line where echart ref is null
  })

  it('handles mark area events', async () => {
    const mockSetCursorStyle = jest.fn()
    const mockOnMarkAreaClick = jest.fn()
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

    renderHook(() => useOnMarkAreaClick(
      eChartsRef,
      markers,
      mockOnMarkAreaClick
    ))

    expect(mockOn).toBeCalledWith('mousemove', 'series.line', expect.any(Function))
    expect(mockOn).toBeCalledWith('click', 'series.line', expect.any(Function))
    expect(Object.keys(callbacks)).toHaveLength(2)

    callbacks['mousemove']('unused')
    expect(mockSetCursorStyle).toBeCalledWith('pointer')

    const data = { a: '1', b: '2' }
    callbacks['click']({ data: { data } })
    expect(mockOnMarkAreaClick).toBeCalledWith(data)
  })
})
