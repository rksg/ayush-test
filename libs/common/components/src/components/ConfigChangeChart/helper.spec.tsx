import { RefObject, useRef, useState } from 'react'

import ReactECharts from 'echarts-for-react'

import { act, renderHook } from '@acx-ui/test-utils'

import { TooltipFormatterParams } from '../Chart/helper'

import {
  getChartLayoutConfig,
  getInitBoundary,
  getInitBrushPositions,
  adjuestDrawPosition,
  adjustAfterBoundaryChanged,
  getDrawPosition,
  draw,
  useDataZoom,
  useDotClick,
  useLegendSelectChanged,
  useBoundaryChange,
  tooltipFormatter,
  getTooltipCoordinate,
  getSelectedDot,
  getSymbol,
  hexToRGB,
  ConfigChange,
  getConfigChangeEntityTypeMapping
}  from './helper'

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  getIntl: () => ({ $t: jest.fn() })
}))

describe('getChartLayoutConfig', () => {
  it('should return correct chart layout config', () => {
    expect(getChartLayoutConfig(100, new Array(10).fill(0))).toEqual({
      chartWidth: 100,
      chartPadding: 10,
      rowHeight: 16,
      rowGap: 4,
      xAxisHeight: 30,
      brushHeight: 200,
      brushWidth: 86400000,
      brushTextHeight: 12,
      legendHeight: 24,
      symbolSize: 12
    })
  })
})

describe('getInitBoundary', () => {
  expect(getInitBoundary([1, 1000])).toEqual({ min: 1, max: 1000 })
})

describe('getInitBrushPositions', () => {
  expect(getInitBrushPositions([1, 1000], 50)).toEqual({
    actual: [[1, 51], [950, 1000]],
    show: [[1, 51], [950, 1000]]
  })
})

describe('adjuestDrawPosition', () => {
  const boundary = { min: 0, max: 100 }
  it('should return correct position', () => {
    const actualArea = [[10,20],[80,90]]
    expect(adjuestDrawPosition(boundary, actualArea, 0)).toEqual([10, 20])
    expect(adjuestDrawPosition(boundary, actualArea, 1)).toEqual([80, 90])
  })
  it('should return correct position when reach the boundary', () => {
    const actualArea = [[-5,5],[95,105]]
    expect(adjuestDrawPosition(boundary, actualArea, 0)).toEqual([0, 10])
    expect(adjuestDrawPosition(boundary, actualArea, 1)).toEqual([90, 100])
  })
  it('should return correct position when block by other brush', () => {
    const actualArea = [[40,50],[40,50]]
    expect(adjuestDrawPosition(boundary, actualArea, 0)).toEqual([30, 40])
    expect(adjuestDrawPosition(boundary, actualArea, 1)).toEqual([50, 60])
  })
  it('should return correct position when reach boundary for one brush only', () => {
    // first brush is out of chart
    expect(adjuestDrawPosition(boundary, [[-15, -5],[-5, 5]], 1)).toEqual([0, 10])
    // second brush is out of chart
    expect(adjuestDrawPosition(boundary, [[95, 105],[105, 115]], 0)).toEqual([90, 100])
  })
})

describe('adjustAfterBoundaryChanged', () => {
  const boundary = { min: 0, max: 100 }
  it('should return correct position', () => {
    const actualArea = [[10,20],[80,90]]
    expect(adjustAfterBoundaryChanged(boundary, actualArea, 0)).toEqual([10, 20])
    expect(adjustAfterBoundaryChanged(boundary, actualArea, 1)).toEqual([80, 90])
  })
  it('should return correct position when reach boundary', () => {
    const actualArea = [[-5,5],[95,105]]
    expect(adjustAfterBoundaryChanged(boundary, actualArea, 0)).toEqual([0, 5])
    expect(adjustAfterBoundaryChanged(boundary, actualArea, 1)).toEqual([95, 100])
  })
  it('should return correct position when reach boundary for one brush only', () => {
    // first brush is out of chart
    expect(adjustAfterBoundaryChanged(boundary, [[-15, -5],[-5, 5]], 0)).toEqual([0, -5])
    expect(adjustAfterBoundaryChanged(boundary, [[-15, -5],[-5, 5]], 1)).toEqual([0, 5])
    // second brush is out of chart
    expect(adjustAfterBoundaryChanged(boundary, [[95, 105],[105, 115]], 0)).toEqual([95, 100])
    expect(adjustAfterBoundaryChanged(boundary, [[95, 105],[105, 115]], 1)).toEqual([105, 100])
  })
})

describe('getDrawPosition',() => {
  it('should return correct position', () => {
    const boundary = { min: 0, max: 100 }
    const actualArea = [[10,20],[80,90]]
    expect(getDrawPosition(50, 10, boundary, actualArea, 0))
      .toEqual({ actual: [[50,60],[80,90]], show: [[50,60],[80,90]] })
  })
})

describe('draw', () => {
  const chartLayoutConfig = getChartLayoutConfig(100, getConfigChangeEntityTypeMapping())
  const areas = { actual: [[0, 50], [950, 1000]], show: [[0, 50], [950, 1000]] }
  const boundary = { min: 0, max: 1000 }
  it('should handle echart ref unavailable', () => {
    const eChartsRef = {} as RefObject<ReactECharts>
    draw(eChartsRef, chartLayoutConfig, areas, boundary, jest.fn())
  })
  it('should call echartInstance.setOption', () => {
    const mockSetOption = jest.fn() as (options: unknown) => void
    const mockConvertToPixel = jest
      .fn((_, points) => points) as (opt: unknown, value: number[]) => number[]
    const mockConvertFromPixel = jest.fn() as (opt: unknown, value: number[]) => number[]
    const eChartsRef = {
      current: {
        getEchartsInstance: () => ({
          setOption: mockSetOption,
          convertToPixel: mockConvertToPixel,
          convertFromPixel: mockConvertFromPixel
        })
      }
    } as RefObject<ReactECharts>
    draw(eChartsRef, chartLayoutConfig, areas, boundary, jest.fn())
    expect(mockSetOption).toBeCalledTimes(1)
  })
  it('should handle brush width <= 0', () => {
    const mockSetOption = jest.fn() as (options: unknown) => void
    const mockConvertToPixel = jest
      .fn((_, points) => points) as (opt: unknown, value: number[]) => number[]
    const mockConvertFromPixel = jest.fn() as (opt: unknown, value: number[]) => number[]
    const eChartsRef = {
      current: {
        getEchartsInstance: () => ({
          setOption: mockSetOption,
          convertToPixel: mockConvertToPixel,
          convertFromPixel: mockConvertFromPixel
        })
      }
    } as RefObject<ReactECharts>
    draw(eChartsRef, chartLayoutConfig,
      { ...areas, show: [[50, 50], [1000, 1000]] }, boundary, jest.fn())
    expect(mockSetOption).toBeCalledTimes(1)
  })
})

type DispatchAction = (
  payload: unknown,
  opt?:
    | boolean
    | {
        silent?: boolean;
        flush?: boolean | undefined;
      }
) => void

describe('useDataZoom', () => {
  beforeEach(() => jest.resetModules())
  it('should handle echart ref unavailable', () => {
    const eChartsRef = {} as RefObject<ReactECharts>
    const setBoundary = jest.fn()
    renderHook(() => useDataZoom(eChartsRef, [0, 1000], setBoundary))
    expect(setBoundary).not.toBeCalled()
  })
  it('should handle datazoom', () => {
    const testParams = {
      type: 'datazoom',
      batch: [{ startValue: 0, endValue: 1000 }]
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const mockDispatchAction = jest.fn() as DispatchAction
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          dispatchAction: mockDispatchAction,
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn)
        })
      }
    } as RefObject<ReactECharts>
    const setBoundary = jest.fn()
    const { unmount, result } = renderHook(() => useDataZoom(eChartsRef, [0, 1000], setBoundary))
    expect(mockOnFn).toBeCalledTimes(1)
    expect(mockDispatchAction).toBeCalledTimes(2)
    expect(setBoundary).toBeCalledTimes(1)
    expect(setBoundary).toBeCalledWith({ min: 0, max: 1000 })
    expect(result.current.canResetZoom).toEqual(false)
    unmount()
    expect(mockOffFn).toBeCalled()
  })
  it('should handle canResetZoom', () => {
    const testParams = {
      type: 'datazoom',
      batch: [{ startValue: 10, endValue: 990 }]
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const mockDispatchAction = jest.fn() as DispatchAction
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          dispatchAction: mockDispatchAction,
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn)
        })
      }
    } as RefObject<ReactECharts>
    const setBoundary = jest.fn()
    const { result } = renderHook(() => useDataZoom(eChartsRef, [0, 1000], setBoundary))
    expect(result.current.canResetZoom).toEqual(true)
  })
  it('should handle resetZoomCallback', () => {
    const testParams = {
      type: 'datazoom',
      batch: [{ startValue: 10, endValue: 990 }]
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const mockDispatchAction = jest.fn() as DispatchAction
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          dispatchAction: mockDispatchAction,
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn)
        })
      }
    } as RefObject<ReactECharts>
    const setBoundary = jest.fn()
    const { result } = renderHook(() => useDataZoom(eChartsRef, [0, 1000], setBoundary))
    act(()=>result.current.resetZoomCallback())
    expect(mockDispatchAction).toBeCalled()
    expect(mockDispatchAction).toHaveBeenLastCalledWith({
      batch: [{ startValue: 0, endValue: 1000 }],
      type: 'dataZoom'
    })
  })
  it('should handle echartInstance.isDisposed', () => {
    const testParams = {
      type: 'datazoom',
      batch: [{ startValue: 10, endValue: 990 }]
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const mockDispatchAction = jest.fn() as DispatchAction
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          dispatchAction: mockDispatchAction,
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn),
          isDisposed: () => true
        })
      }
    } as RefObject<ReactECharts>
    const setBoundary = jest.fn()
    const { unmount } = renderHook(() => useDataZoom(eChartsRef, [0, 1000], setBoundary))
    unmount()
    expect(mockOffFn).not.toBeCalledTimes(1)
  })
})

describe('useDotClick', () => {
  it('should handle echart ref unavailable', () => {
    const eChartsRef = {} as RefObject<ReactECharts>
    const onDotClick = jest.fn()
    const setSelected = jest.fn()
    renderHook(() => useDotClick(eChartsRef, setSelected, onDotClick))
    expect(onDotClick).not.toBeCalled()
    expect(setSelected).not.toBeCalled()
  })
  it('should handle dot onClick', () => {
    const testParams = {
      componentSubType: 'scatter',
      data: [1654423052112, 'ap', { id: 0 }]
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn)
        })
      }
    } as RefObject<ReactECharts>
    const onDotClick = jest.fn()
    const setSelected = jest.fn()
    const { unmount } = renderHook(() => useDotClick(eChartsRef, setSelected, onDotClick))
    expect(mockOnFn).toBeCalledTimes(1)
    expect(onDotClick).toBeCalledTimes(1)
    expect(onDotClick).toBeCalledWith(testParams.data[2])
    expect(setSelected).toBeCalledTimes(1)
    expect(setSelected).toBeCalledWith((testParams.data[2] as ConfigChange).id)
    unmount()
    expect(mockOffFn).toBeCalledTimes(1)
  })
  it('should not handle onClick for other element', () => {
    const testParams = {
      componentSubType: 'other',
      data: [1654423052112, 'ap', { id: 0 }]
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn)
        })
      }
    } as RefObject<ReactECharts>
    const onDotClick = jest.fn()
    const setSelected = jest.fn()
    renderHook(() => useDotClick(eChartsRef, setSelected, onDotClick))
    expect(mockOnFn).toBeCalledTimes(1)
    expect(onDotClick).not.toBeCalled()
    expect(setSelected).not.toBeCalled()
  })
  it('should handle echartInstance.isDisposed', () => {
    const testParams = {
      componentSubType: 'scatter',
      data: [1654423052112, 'ap', { id: 0 }]
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn),
          isDisposed: () => true
        })
      }
    } as RefObject<ReactECharts>
    const { unmount } = renderHook(() => useDotClick(eChartsRef, jest.fn(), jest.fn()))
    unmount()
    expect(mockOffFn).not.toBeCalledTimes(1)
  })
})

describe('useLegendSelectChanged', () => {
  const testParams = {
    type: 'legendselectchanged',
    name: 'Venue',
    selected: { 'Venue': false, 'WLAN': true, 'AP Group': true, 'AP': true }
  }
  it('should handle echart ref unavailable', () => {
    const eChartsRef = {} as RefObject<ReactECharts>
    const setSelectedLegend = jest.fn()
    renderHook(() => useLegendSelectChanged(eChartsRef, setSelectedLegend))
    expect(setSelectedLegend).not.toBeCalled()
  })
  it('should handle legend change', () => {
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn)
        })
      }
    } as RefObject<ReactECharts>
    const setSelectedLegend = jest.fn()
    const { unmount } = renderHook(() => useLegendSelectChanged(eChartsRef, setSelectedLegend))
    expect(mockOnFn).toBeCalledTimes(1)
    expect(setSelectedLegend).toBeCalledTimes(1)
    expect(setSelectedLegend).toBeCalledWith(testParams.selected)
    unmount()
    expect(mockOffFn).toBeCalledTimes(1)
  })
  it('should handle all legend deselected', () => {
    const testParams = {
      type: 'legendselectchanged',
      name: 'Venue',
      selected: { 'Venue': false, 'WLAN': false, 'AP Group': false, 'AP': false }
    }
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn)
        })
      }
    } as RefObject<ReactECharts>
    const setSelectedLegend = jest.fn()
    const { unmount } = renderHook(() => useLegendSelectChanged(eChartsRef, setSelectedLegend))
    expect(mockOnFn).toBeCalledTimes(1)
    expect(setSelectedLegend).toBeCalledTimes(1)
    expect(setSelectedLegend)
      .toBeCalledWith({ 'Venue': true, 'WLAN': true, 'AP Group': true, 'AP': true })
    unmount()
    expect(mockOffFn).toBeCalledTimes(1)
  })
  it('should handle echartInstance.isDisposed', () => {
    const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
    const mockOffFn = jest.fn()
    const eChartsRef = {
      current: {
        getEchartsInstance: ()=>({
          on: (eventType:string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
          off: (eventType:string, fn: Function) => mockOffFn(eventType, fn),
          isDisposed: () => true
        })
      }
    } as RefObject<ReactECharts>
    const { unmount } = renderHook(() => useLegendSelectChanged(eChartsRef, jest.fn()))
    unmount()
    expect(mockOffFn).not.toBeCalledTimes(1)
  })
})

describe('useBoundaryChange', () => {
  it('should return correct boundary and brushPositions', () => {
    const useTestHook = () => {
      const eChartsRef = useRef<ReactECharts>(null)
      const [ chartBoundary, setChartBoundary ] = useState<[number, number]>([1, 1000])
      return {
        setChartBoundary,
        render: useBoundaryChange(eChartsRef, {}, chartBoundary, 50)
      }
    }
    const { result } = renderHook(() => useTestHook())
    expect(result.current.render.boundary).toEqual({ min: 1, max: 1000 })
    expect(result.current.render.brushPositions)
      .toEqual({ actual: [[1, 51], [950, 1000]], show: [[1, 51], [950, 1000]] })
    act(()=>{
      result.current.setChartBoundary([25, 50])
    })
    expect(result.current.render.boundary).toEqual({ min: 25, max: 50 })
    expect(result.current.render.brushPositions)
      .toEqual({ actual: [[25, 75], [0, 50]], show: [[25, 0], [75, 50]] })
  })
})

describe('tooltipFormatter',() => {
  const singleparameters = { data: [1605628800000] } as TooltipFormatterParams
  const multiParameters = [ singleparameters ] as TooltipFormatterParams[]
  it('should return correct Html string for single value', async () => {
    expect(tooltipFormatter(singleparameters)).toMatchSnapshot()
  })
  it('should return correct Html string for multiple value', async () => {
    expect(tooltipFormatter(multiParameters)).toMatchSnapshot()
  })
})

describe('getTooltipCoordinate',() => {
  it('should return correct coordinate', async () => {
    expect(getTooltipCoordinate(100)([200, 300])).toStrictEqual([212, 100])
  })
})

describe('hexToRGB',() => {
  expect(hexToRGB(' #FFFFFF')).toEqual('rgb(255,255,255)')
  expect(hexToRGB(' #333333')).toEqual('rgb(51,51,51)')
})

describe('getSelectedDot', () => {
  it('should match snapshot', () => {
    expect(getSelectedDot('color')).toMatchSnapshot()
  })
})

describe('getSymbol', () => {
  it('should return correct symbol which matchs snapshot', () => {
    expect(getSymbol(0)([1605628800000, 'ap', { id: 0, type: 'ap' } as ConfigChange]))
      .toMatchSnapshot()
    expect(getSymbol(1)([1605628800000, 'ap', { id: 0, type: 'ap' } as ConfigChange]))
      .toMatchSnapshot()
  })
})