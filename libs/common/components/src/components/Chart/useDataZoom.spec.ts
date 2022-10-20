import React, { RefObject } from 'react'

import { ECharts }  from 'echarts'
import ReactECharts from 'echarts-for-react'

import { renderHook, act } from '@acx-ui/test-utils'

import { getSeriesData } from '../MultiLineTimeSeriesChart/stories'

import { useDataZoom } from './useDataZoom'

type DispatchAction = ((payload: unknown, opt?: boolean | {
  silent?: boolean;
  flush?: boolean | undefined;
}) => void)
let onCallbacks: Record<string, (event: unknown) => void>
let mockOn: (type: string, callback: ((event: unknown) => void)) => void
let mockDispatchAction: DispatchAction
let eChartsRef: RefObject<ReactECharts>

describe('useDataZoom', () => {
  beforeEach(() => {
    onCallbacks = {}
    mockOn = jest.fn().mockImplementation((type, callback) => onCallbacks[type] = callback)
    mockDispatchAction = jest.fn() as DispatchAction
    eChartsRef = {
      current: {
        getEchartsInstance: () => ({
          dispatchAction: mockDispatchAction,
          on: mockOn
        } as unknown as ECharts)
      }
    } as RefObject<ReactECharts>
  })

  it('handles null echart ref', () => {
    eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => useDataZoom(eChartsRef, true, getSeriesData()))
    // intentionally no assertion to cover the line where echart ref is null
  })

  it('does not dispatch action to select zoom if zoom is not enabled', () => {
    renderHook(() => useDataZoom(eChartsRef, false, getSeriesData()))
    expect(mockDispatchAction).not.toBeCalled()
  })

  it('dispatches action to select zoom', () => {
    renderHook(() => useDataZoom(eChartsRef, true, getSeriesData()))
    expect(mockDispatchAction).toBeCalledTimes(1)
    expect(mockDispatchAction).toBeCalledWith({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
  })

  it('dispatches action for initial zoom', () => {
    renderHook(() => useDataZoom(eChartsRef, true, getSeriesData(), ['2020-11-10', '2020-11-20']))
    expect(mockDispatchAction).toBeCalledTimes(2)
    expect(mockDispatchAction).nthCalledWith(1, {
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
    expect(mockDispatchAction).nthCalledWith(2, {
      type: 'dataZoom',
      startValue: '2020-11-10',
      endValue: '2020-11-20'
    })
  })

  it('does not dispatch action for initial zoom if range is same as data', () => {
    renderHook(() => useDataZoom(eChartsRef, true, getSeriesData(), ['2020-10-29', '2020-12-04']))
    expect(mockDispatchAction).toBeCalledTimes(1)
    expect(mockDispatchAction).toBeCalledWith({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
  })

  it('does not dispatch action for initial zoom if range exceeds data', () => {
    renderHook(() => useDataZoom(eChartsRef, true, getSeriesData(), ['2020-10-29', '2020-12-05']))
    expect(mockDispatchAction).toBeCalledTimes(1)
    expect(mockDispatchAction).toBeCalledWith({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true
    })
  })

  it('handles resetZoomCallback if echart ref is null', () => {
    eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => {
      const [, resetZoomCallback] = useDataZoom(eChartsRef, true, getSeriesData())
      resetZoomCallback()
    })
  })

  it('handles zoom and reset', async () => {
    const mockOnDataZoom = jest.fn()
    const mockSetCanResetZoom = jest.fn()
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation(() => [false, mockSetCanResetZoom])
    let resetZoomCallback: () => void
    renderHook(() => {
      const [, callback] = useDataZoom(
        eChartsRef,
        true,
        getSeriesData(),
        undefined,
        mockOnDataZoom
      )
      resetZoomCallback = callback
    })
    onCallbacks['datazoom']({
      batch: [{
        startValue: +new Date('2020-10-01'),
        endValue: +new Date('2020-10-02')
      }]
    })
    expect(mockSetCanResetZoom).toHaveBeenCalledWith(true)
    act(() => resetZoomCallback())
    expect(mockDispatchAction)
      .toHaveBeenNthCalledWith(2, { type: 'dataZoom', start: 0, end: 100 })
    onCallbacks['datazoom']({ start: 0, end: 100 })
    expect(mockSetCanResetZoom).toHaveBeenCalledWith(false)
  })
})
