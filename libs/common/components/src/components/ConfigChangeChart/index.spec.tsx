
import { RefObject } from 'react'

import { render, renderHook } from '@testing-library/react'
import ReactECharts           from 'echarts-for-react'
import moment                 from 'moment-timezone'

import {
  hexToRGB,
  getSelectedDot,
  getSymbol,
  getDragPosition,
  getDrawPosition,
  getZoomPosition,
  useDotClick,
  useBoundaryChange,
  tooltipFormatter,
  useDatazoom,
  useLegendSelectChanged,
  ConfigChangeChart,
  ConfigChange
} from '.'

import type { TooltipFormatterParams } from '../Chart/helper'

describe('ConfigChangeChart',() => {
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
  describe('getDragPosition', () => {
    const boundary = { min: 0, max: 100 }
    it('should return correct position', () => {
      const actualArea = [[10,20],[80,90]]
      expect(getDragPosition(boundary, actualArea, 0)).toEqual([10, 20])
      expect(getDragPosition(boundary, actualArea, 1)).toEqual([80, 90])
    })
    it('should return correct position when reach the boundary', () => {
      const actualArea = [[-5,5],[95,105]]
      expect(getDragPosition(boundary, actualArea, 0)).toEqual([0, 10])
      expect(getDragPosition(boundary, actualArea, 1)).toEqual([90, 100])
    })
    it('should return correct position when block by other brush', () => {
      const actualArea = [[40,50],[40,50]]
      expect(getDragPosition(boundary, actualArea, 0)).toEqual([30, 40])
      expect(getDragPosition(boundary, actualArea, 1)).toEqual([50, 60])
    })
    it('should return correct position when reach boundary for one brush only', () => {
      // first brush is out of chart
      expect(getDragPosition(boundary, [[-15, -5],[-5, 5]], 1)).toEqual([0, 10])
      // second brush is out of chart
      expect(getDragPosition(boundary, [[95, 105],[105, 115]], 0)).toEqual([90, 100])
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
  describe('getZoomPosition', () => {
    const boundary = { min: 0, max: 100 }
    it('should return correct position', () => {
      const actualArea = [[10,20],[80,90]]
      expect(getZoomPosition(boundary, actualArea, 0)).toEqual([10, 20])
      expect(getZoomPosition(boundary, actualArea, 1)).toEqual([80, 90])
    })
    it('should return correct position when reach boundary', () => {
      const actualArea = [[-5,5],[95,105]]
      expect(getZoomPosition(boundary, actualArea, 0)).toEqual([0, 5])
      expect(getZoomPosition(boundary, actualArea, 1)).toEqual([95, 100])
    })
    it('should return correct position when reach boundary for one brush only', () => {
      // first brush is out of chart
      expect(getZoomPosition(boundary, [[-15, -5],[-5, 5]], 0)).toEqual([0, -5])
      expect(getZoomPosition(boundary, [[-15, -5],[-5, 5]], 1)).toEqual([0, 5])
      // second brush is out of chart
      expect(getZoomPosition(boundary, [[95, 105],[105, 115]], 0)).toEqual([95, 100])
      expect(getZoomPosition(boundary, [[95, 105],[105, 115]], 1)).toEqual([105, 100])
    })
  })
  describe('useDotClick', () => {
    it('should handle echart ref unavailable', () => {
      const eChartsRef = {} as RefObject<ReactECharts>
      const onDotClick = jest.fn()
      const setSelected = jest.fn()
      renderHook(() => useDotClick(eChartsRef, onDotClick, setSelected))
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
      renderHook(() => useDotClick(eChartsRef, onDotClick, setSelected))
      expect(mockOnFn).toBeCalledTimes(1) // for on
      expect(onDotClick).toBeCalledTimes(1)
      expect(onDotClick).toBeCalledWith(testParams.data[2])
      expect(setSelected).toBeCalledTimes(1)
      expect(setSelected).toBeCalledWith((testParams.data[2] as ConfigChange).id)
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
      renderHook(() => useDotClick(eChartsRef, onDotClick, setSelected))
      expect(mockOnFn).toBeCalledTimes(1) // for on
      expect(onDotClick).not.toBeCalled()
      expect(setSelected).not.toBeCalled()
    })
  })
  describe('useBoundaryChange', () => {
    it('should handle when boundary change', () => {
      const brushPositions = {
        actual: [[10, 20], [80, 90]],
        show: [[10, 20], [80, 90]]
      }
      const boundary = { min: 0, max: 100 }
      const getZoomPosition = jest.fn(
        (boundary, actualBrushPositions, index)=>brushPositions.actual[index])
      const setBrushPositions = jest.fn()
      const draw = jest.fn()
      renderHook(() => useBoundaryChange(
        boundary, brushPositions, setBrushPositions, getZoomPosition, draw))
      expect(getZoomPosition).toBeCalledTimes(2)
      expect(getZoomPosition).toBeCalledWith(boundary, brushPositions.actual, 0)
      expect(getZoomPosition).toBeCalledWith(boundary, brushPositions.actual, 1)
      expect(setBrushPositions).toBeCalledTimes(1)
      expect(setBrushPositions).toBeCalledWith(brushPositions)
      expect(draw).toBeCalledTimes(1)
      expect(draw).toBeCalledWith(brushPositions)
    })
  })
  describe('tooltipFormatter',() => {
    const timezone = 'UTC'
    beforeEach(() => {
      moment.tz.setDefault(timezone)
    })
    afterEach(() => {
      moment.tz.setDefault(moment.tz.guess())
    })
    const singleparameters = { data: [1605628800000] } as TooltipFormatterParams
    const multiParameters = [ singleparameters ] as TooltipFormatterParams[]
    it('should return correct Html string for single value', async () => {
      expect(tooltipFormatter(singleparameters)).toMatchSnapshot()
    })
    it('should return correct Html string for multiple value', async () => {
      expect(tooltipFormatter(multiParameters)).toMatchSnapshot()
    })
  })
  describe('useDatazoom',() => {
    it('should return correct boundary',() => {
      const chartBoundary = [100, 1100]
      const setBoundary = jest.fn(value => value)
      renderHook(() => useDatazoom(chartBoundary, setBoundary)({ batch: [{ start: 10, end: 90 }] }))
      expect(setBoundary).toBeCalledTimes(1)
      expect(setBoundary).toBeCalledWith({ max: 1000, min: 200 })
    })
  })
  describe('onLegendselectchanged',() => {
    it('should return correct selected legends',() => {
      const setSelectedLegend = jest.fn(value => value)
      const selected = { option1: true, option2: false }
      renderHook(() => useLegendSelectChanged(setSelectedLegend)({ selected }))
      expect(setSelectedLegend).toBeCalledTimes(1)
      expect(setSelectedLegend).toBeCalledWith(selected)
    })
    it('should select all if no legend is selected',() => {
      const setSelectedLegend = jest.fn(value => value)
      const selected = { option1: false, option2: false }
      renderHook(() => useLegendSelectChanged(setSelectedLegend)({ selected }))
      expect(setSelectedLegend).toBeCalledTimes(1)
      expect(setSelectedLegend).toBeCalledWith({ option1: true, option2: true })
    })
  })
  describe('ConfigChangeChart',() => {
    it('should render canvas', () => {
      const types = ['ap', 'apGroup', 'wlan', 'venue']
      const chartBoundary = [1654423052112, 1657015052112]
      const sampleData = new Array((chartBoundary[1]-chartBoundary[0])/(12*60*60*1000))
        .fill(0).map((_,index)=>({
          id: index,
          timestamp: `${chartBoundary[0] + 12 * 60 * 60 * 1000 * index}`,
          type: types[index % 4],
          name: 'name',
          key: 'key',
          oldValues: [ 'oldValues' ],
          newValues: [ 'newValues' ]
        }))
      const { asFragment } = render(<ConfigChangeChart
        style={{ width: 850 }}
        data={sampleData}
        chartBoundary={chartBoundary}
        onDotClick={jest.fn()}
      />)
      // eslint-disable-next-line testing-library/no-node-access
      expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
      // eslint-disable-next-line testing-library/no-node-access
      expect(asFragment().querySelector('canvas')).not.toBeNull()
    })
  })
})
