import React, { RefObject } from 'react'

import { renderHook, act } from '@testing-library/react'
import { ECharts }         from 'echarts'
import ReactECharts        from 'echarts-for-react'
import { BrowserRouter }   from 'react-router-dom'

import { qualityDataObj, incidentDataObj, roamingDataObj }                from './__tests__/fixtures'
import { Event, LabelledQuality, IncidentDetails, RoamingTimeSeriesData } from './config'
import {
  useDotClick,
  useDataZoom,
  getSeriesItemColor,
  getSeriesData,
  getBarColor,
  renderCustomItem
} from './TimelineChart'

import type { CustomSeriesRenderItemAPI, CustomSeriesRenderItemParams } from 'echarts'
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
describe('TimelineChartComponent', () => {
  describe('useDotClick', () => {
    it('should handle echart ref unavailable', () => {
      const eChartsRef = undefined as unknown as RefObject<ReactECharts>
      const onDotClick = jest.fn()
      const popoverRef = undefined as unknown as RefObject<HTMLDivElement>
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef), { wrapper: BrowserRouter })
      expect(onDotClick).not.toBeCalled()
    })
    it('should handle dot onClick', () => {
      const testRect = {
        x: 30,
        y: 30,
        width: 20,
        height: 20,
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      }

      const testParams = {
        componentSubType: 'scatter',
        data: [1654423052112, 'connectionEvents', testEvent],
        event: {
          event: {
            clientX: 10,
            clientY: 20,
            currentTarget: {
              getBoundingClientRect: jest.fn(() => testRect)
            }
          }
        }
      }
      const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) => fn(testParams))
      const mockOffFn = jest.fn()
      const eChartsRef = {
        current: {
          getEchartsInstance: () => ({
            on: (eventType: string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
            off: (eventType: string, fn: Function) => mockOffFn(eventType, fn)
          })
        }
      } as RefObject<ReactECharts>
      const onDotClick = jest.fn()
      const popoverRef = { current: {
        getBoundingClientRect: jest.fn(() => testRect)
      } } as unknown as RefObject<HTMLDivElement>
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef), { wrapper: BrowserRouter })
      expect(mockOnFn).toBeCalledTimes(1) // for on
      expect(onDotClick).toBeCalledTimes(1)
      expect(onDotClick).toBeCalledWith({ ...(testParams.data[2] as Event), x: 30, y: 10 })
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
          getEchartsInstance: () => ({
            on: (eventType: string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
            off: (eventType: string, fn: Function) => mockOffFn(eventType, fn)
          })
        }
      } as RefObject<ReactECharts>
      const onDotClick = jest.fn()
      const popoverRef = undefined as unknown as RefObject<HTMLDivElement>
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef), { wrapper: BrowserRouter })
      expect(mockOnFn).toBeCalledTimes(1)
      expect(onDotClick).not.toBeCalled()
    })
  })
  describe('getSeriesItemColor', () => {
    it('show return default color when data is not defined', () => {
      const params = { data: {} as unknown as Event[] }
      expect(getSeriesItemColor(params)).toBe('#ACAEB0')
    })
    it('show return valid color', () => {
      const params = {
        data: [1654423052112, 'connectionEvent', testEvent as unknown as Event] as Event[]
      }
      expect(getSeriesItemColor(params)).toBe('#F7B41E')
    })
  })
  describe('getSeriesData', () => {
    it('show return valid incidents series data', () => {
      const incidentsData = [
        {
          code: 'ttc',
          color: '--acx-semantics-yellow-30',
          date: 'Nov 11 2022 19:21:00',
          description: 'Connection (Time To Connect)',
          end: 1668166380000,
          id: '1b8efe92-7cc1-4ca2-9c76-6c871c8665a3',
          start: 1668165660000,
          title: 'Time to connect is greater than 2 seconds in Venue: cliexp4',
          icon: ''
        }
      ]
      const roamingEvent = {
        code: 'ttc',
        color: '--acx-semantics-yellow-30',
        details: 'Connection (Time To Connect)',
        end: 1668166380000,
        start: 1668165660000,
        seriesKey: 'all',
        label: 'test',
        value: 'test'
      }
      expect(getSeriesData(incidentsData, 'connection', 'incidents')).toEqual([
        [
          1668165660000,
          'connection',
          1668166380000,
          {
            code: 'ttc',
            color: '--acx-semantics-yellow-30',
            date: 'Nov 11 2022 19:21:00',
            description: 'Connection (Time To Connect)',
            end: 1668166380000,
            icon: '',
            id: '1b8efe92-7cc1-4ca2-9c76-6c871c8665a3',
            start: 1668165660000,
            title: 'Time to connect is greater than 2 seconds in Venue: cliexp4'
          }
        ]
      ])
      expect(getSeriesData(incidentsData, 'connection', 'unknown')).toEqual([])
      expect(
        getSeriesData(
          { all: [roamingEvent] } as unknown as RoamingTimeSeriesData[],
          'all',
          'roaming'
        )
      ).toEqual([
        [
          1668165660000,
          'all',
          {
            code: 'ttc',
            color: '--acx-semantics-yellow-30',
            details: 'Connection (Time To Connect)',
            end: 1668166380000,
            label: 'test',
            seriesKey: 'all',
            start: 1668165660000,
            value: 'test'
          }
        ]
      ])
    })
  })
  describe('renderCustomItem', () => {
    it('show return the shape obj', () => {
      expect(
        renderCustomItem(
          {} as unknown as CustomSeriesRenderItemParams,
          {} as unknown as CustomSeriesRenderItemAPI
        )
      ).toEqual({
        shape: { height: NaN, width: NaN, x: undefined, y: NaN },
        style: undefined,
        type: 'rect'
      })
    })
  })
  describe('getBarColor', () => {
    it('show return valid bar color for connection Quality', () => {
      expect(
        getBarColor({ data: qualityDataObj as unknown as LabelledQuality[], seriesName: 'quality' })
      ).toEqual('#23AB36')
      expect(
        getBarColor({ data: {} as unknown as LabelledQuality[], seriesName: 'quality' })
      ).toEqual('#ACAEB0')
    })
    it('show return valid bar color for incident chart', () => {
      expect(
        getBarColor({
          data: incidentDataObj as unknown as IncidentDetails[],
          seriesName: 'incidents'
        })
      ).toEqual('#F7B41E')
      expect(
        getBarColor({ data: {} as unknown as IncidentDetails[], seriesName: 'incidents' })
      ).toEqual(undefined)
    })
    it('show return valid bar color for roaming bar chart', () => {
      expect(
        getBarColor({
          data: roamingDataObj as unknown as RoamingTimeSeriesData[],
          seriesName: 'roaming'
        })
      ).toEqual('rgba(194, 178, 36, 1)')
      expect(
        getBarColor({ data: {} as unknown as RoamingTimeSeriesData[], seriesName: 'roaming' })
      ).toEqual(undefined)
    })
    it('show return empty string for unknown category', () => {
      expect(
        getBarColor({ data: {} as unknown as RoamingTimeSeriesData[], seriesName: 'unknown' })
      ).toEqual('')
    })
  })

  describe('useDataZoom', () => {
    type DispatchAction = (
      payload: unknown,
      opt?:
        | boolean
        | {
            silent?: boolean;
            flush?: boolean | undefined;
          }
    ) => void
    let onCallbacks: Record<string, (event: unknown) => void>
    let mockOn: (type: string, callback: (event: unknown) => void) => void
    let mockDispatchAction: DispatchAction
    let eChartsRef: RefObject<ReactECharts>
    beforeEach(() => {
      onCallbacks = {}
      mockOn = jest.fn().mockImplementation((type, callback) => (onCallbacks[type] = callback))
      mockDispatchAction = jest.fn() as DispatchAction
      eChartsRef = {
        current: {
          getEchartsInstance: () =>
            ({
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
        const [, callback] = useDataZoom(eChartsRef, true, onDataZoom)
        resetZoomCallback = callback
      })
      onCallbacks['datazoom']({
        batch: [
          {
            startValue: +new Date('2020-10-01'),
            endValue: +new Date('2020-10-02')
          }
        ]
      })
      expect(mockSetCanResetZoom).toHaveBeenCalledWith(true)
      act(() => resetZoomCallback())
      expect(mockDispatchAction).toHaveBeenNthCalledWith(2, {
        type: 'dataZoom',
        start: 0,
        end: 100
      })
      onCallbacks['datazoom']({ start: 0, end: 100 })
      expect(mockSetCanResetZoom).toHaveBeenCalledWith(false)
    })
  })
})
