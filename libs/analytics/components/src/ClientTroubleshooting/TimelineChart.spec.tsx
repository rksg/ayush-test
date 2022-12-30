
import React, { RefObject } from 'react'

import { renderHook, act } from '@testing-library/react'
import { ECharts }         from 'echarts'
import ReactECharts        from 'echarts-for-react'

import {  Event }                                       from './EventsTimeline'
import { useDotClick, useDataZoom, getSeriesItemColor } from './TimelineChart'

const testEvent = {
  timestamp: '2022-11-17T06:19:34.520Z',
  event: 'EVENT_CLIENT_DISCONNECT',
  ttc: '4200',
  mac: '94:B3:4F:3D:15:B0',
  apName: 'R750-11-112',
  path: [
    {
      type: 'zone',
      name: 'BDCSZ'
    },
    {
      type: 'apGroup',
      name: 'No group (inherit from Venue)'
    },
    {
      type: 'ap',
      name: '94:B3:4F:3D:15:B0'
    }
  ],
  code: 'test',
  state: 'normal',
  failedMsgId: '8',
  messageIds: 'test',
  radio: '5',
  ssid: 'cliexp4',
  type: 'connectionEvents',
  key: '166866597452094:B3:4F:3D:15:B0EVENT_CLIENT_DISCONNECT411',
  start: 1668665974520,
  end: 1668665974520,
  category: 'slow',
  seriesKey: 'all'
}
describe('TimelineChartComponent',() => {
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
        data: [1654423052112, 'connectionEvents', testEvent]
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
      expect(setSelected).toBeCalledWith((testParams.data[2] as unknown as Event))
    })
    it('should not handle onClick for other element', () => {
      const testParams = {
        componentSubType: 'other',
        data: [1654423052112, 'connectionEvents', { id: 0 }]
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
      expect(mockOnFn).toBeCalledTimes(1)
      expect(onDotClick).not.toBeCalled()
      expect(setSelected).not.toBeCalled()
    })
  })
  describe('getSeriesItemColor', () => {
    it('show return default color when data is not defined', () => {
      const params = { data: {} }
      expect(getSeriesItemColor(params)).toBe('#ACAEB0')
    })
    it('show return valid color', () => {
      const params = {
        data: [
          1654423052112,
          'connectionEvent',
          testEvent as unknown as Event
        ] }
      expect(getSeriesItemColor(params)).toBe('#F7B41E')
    })
  })

  describe('useDataZoom', () => {
    type DispatchAction = ((payload: unknown, opt?: boolean | {
      silent?: boolean;
      flush?: boolean | undefined;
    }) => void)
    let onCallbacks: Record<string, (event: unknown) => void>
    let mockOn: (type: string, callback: ((event: unknown) => void)) => void
    let mockDispatchAction: DispatchAction
    let eChartsRef: RefObject<ReactECharts>
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

    it('does not dispatch action to select zoom if zoom is not enabled', () => {
      renderHook(() => useDataZoom(eChartsRef, false))
      expect(mockDispatchAction).not.toBeCalled()
    })

    it('dispatches action to select zoom', () => {
      renderHook(() => useDataZoom(eChartsRef, true))
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
        const [, resetZoomCallback] = useDataZoom(eChartsRef, true)
        resetZoomCallback()
      })
    })

    it('handles zoom and reset', async () => {
      const mockSetCanResetZoom = jest.fn()
      const onDataZoom = jest.fn()

      const useStateSpy = jest.spyOn(React, 'useState')
      useStateSpy.mockImplementation(() => [false, mockSetCanResetZoom])
      let resetZoomCallback: () => void
      renderHook(() => {
        const [, callback] = useDataZoom(
          eChartsRef,
          true,
          onDataZoom
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
})
