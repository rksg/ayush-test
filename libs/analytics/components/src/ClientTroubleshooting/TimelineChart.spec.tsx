import React, { createRef, MutableRefObject, RefObject } from 'react'

import { ECharts, EChartsType } from 'echarts'
import ReactECharts             from 'echarts-for-react'
import moment                   from 'moment-timezone'

import { cleanup, render, fireEvent, renderHook, act, waitFor, screen } from '@acx-ui/test-utils'
import { TimeStampRange }                                               from '@acx-ui/types'

import { qualityDataObj, incidentDataObj, roamingDataObj, connectionEvents }                           from './__tests__/fixtures'
import { Event, LabelledQuality, IncidentDetails, RoamingTimeSeriesData, ClientTroubleShootingConfig } from './config'
import {
  useDotClick,
  useDataZoom,
  getSeriesItemColor,
  getSeriesData,
  getBarColor,
  renderCustomItem,
  TimelineChart,
  updateBoundary
} from './TimelineChart'
import { transformEvents } from './util'

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

function testHelpers (customSeries?: object) {
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
  const defaultSeries = {
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
  const mockOnFn = jest.fn((_: string, fn: (params: unknown) => void) =>
    fn(customSeries ?? defaultSeries))
  const mockOffFn = jest.fn()
  const eChartsRef = {
    current: {
      getEchartsInstance: () => ({
        on: (eventType: string, fn: (params: unknown) => void) => mockOnFn(eventType, fn),
        off: (eventType: string, fn: Function) => mockOffFn(eventType, fn)
      })
    }
  } as RefObject<ReactECharts>
  return { testRect, eChartsRef, mockOnFn, testParams: defaultSeries }
}

const basePath = '/t/testPath'
describe('TimelineChartComponent', () => {
  describe('chart rendering tests', () => {
    afterEach(() => cleanup())
    it('should handle mouse over correctly with empty data', async () => {
      const events = transformEvents(connectionEvents, [], [])
        .map(event => ({ ...event, seriesKey: 'all' })) as Event[]
      const { chartMapping } = ClientTroubleShootingConfig.timeLine[0]
      const chartRef: MutableRefObject<EChartsType[] | null> = createRef<EChartsType[]>()
      chartRef.current = []
      const TestWrapper = () => {
        const onCharyReady = (chart: EChartsType | null) => {
          if (chart && chartRef.current) {
            chartRef.current.push(chart)
          }
        }
        return <TimelineChart
          style={{ height: 400, width: 400 }}
          data={events}
          chartBoundary={[1668268800000, 1668441600000]}
          sharedChartName='testChart'
          mapping={chartMapping.slice().reverse()}
          showResetZoom={true}
          onChartReady={onCharyReady}
        />
      }
      render(<TestWrapper />,{ route: { wrapRoutes: true } })
      await waitFor(() => expect(chartRef.current?.length).toBeGreaterThan(0))
      const instance = chartRef.current![0]
      act(() => { instance.triggerWithContext('mouseover') })
      expect(instance).toBeDefined()
    })
    it('should handle dotClick correctly with valid data', async () => {
      const onDotClick = jest.fn()
      const events = transformEvents(connectionEvents, [], [])
        .map(event => ({ ...event, seriesKey: 'all' })) as Event[]
      const ref = createRef<HTMLDivElement>()
      const { chartMapping } = ClientTroubleShootingConfig.timeLine[0]
      const chartRef: MutableRefObject<EChartsType[] | null> = createRef<EChartsType[]>()
      chartRef.current = []
      const TestWrapper = () => {
        const onCharyReady = (chart: EChartsType | null) => {
          if (chart && chartRef.current) {
            chartRef.current.push(chart)
          }
        }
        return <div ref={ref}>
          <TimelineChart
            style={{ height: 400, width: 400 }}
            data={events}
            chartBoundary={[1668268800000, 1668441600000]}
            sharedChartName='testChart'
            mapping={chartMapping.slice().reverse()}
            showResetZoom={true}
            onChartReady={onCharyReady}
            onDotClick={onDotClick}
            popoverRef={ref}
          />
        </div>
      }
      render(<TestWrapper />,{ route: { wrapRoutes: true } })
      expect(ref.current).toBeInTheDocument()
      await waitFor(() => expect(chartRef.current?.length).toBeGreaterThan(0))
      expect(onDotClick).toBeCalledTimes(0)
      const instance = chartRef.current![0]
      act(() => { instance.triggerWithContext('click', {
        componentSubType: 'scatter',
        data: [1668378780000, 'all', events[0]],
        event: { event: { clientX: 10, clientY: 10 } } })
      })
      expect(onDotClick).toBeCalledTimes(1)
      expect(onDotClick).toBeCalledWith({ ...events[0], x: -10, y: -10 })
    })
    it('should handle mouse zoom with drag correctly with valid data', async () => {
      const events = transformEvents(connectionEvents, [], [])
        .map(event => ({ ...event, seriesKey: 'all' })) as Event[]
      const ref = createRef<HTMLDivElement>()
      const { chartMapping } = ClientTroubleShootingConfig.timeLine[0]
      const chartRef: MutableRefObject<EChartsType[] | null> = createRef<EChartsType[]>()
      chartRef.current = []
      const TestWrapper = () => {
        const onCharyReady = (chart: EChartsType | null) => {
          if (chart && chartRef.current) {
            chartRef.current.push(chart)
          }
        }
        return <div ref={ref}>
          <TimelineChart
            style={{ height: 400, width: 400 }}
            data={events}
            chartBoundary={[1668268800000, 1668441600000]}
            sharedChartName='testChart'
            mapping={chartMapping.slice().reverse()}
            hasXaxisLabel={true}
            showResetZoom={true}
            onChartReady={onCharyReady}
          />
        </div>
      }
      render(<TestWrapper />,{ route: { wrapRoutes: true } })
      expect(ref.current).toBeInTheDocument()
      await waitFor(() => expect(chartRef.current?.length).toBeGreaterThan(0))
      const instance = chartRef.current![0]
      act(() => { instance.dispatchAction({
        type: 'dataZoom',
        start: 25,
        end: 75
      })})
      const reset = await screen.findByRole('button', { name: 'Reset Zoom' })
      expect(reset).toBeVisible()
      fireEvent.click(reset)
    })
  })
  describe('updateBoundary', () => {
    it('should update object as intended', () => {
      const ref = { current: null } as unknown as MutableRefObject<TimeStampRange>
      updateBoundary([1234, 1245], ref)
      expect(ref.current).toMatchObject([1234, 1245])
    })
  })
  describe('useDotClick', () => {
    it('should handle echart ref unavailable', () => {
      const eChartsRef = undefined as unknown as RefObject<ReactECharts>
      const onDotClick = jest.fn()
      const popoverRef = undefined as unknown as RefObject<HTMLDivElement>
      const navigate = jest.fn()
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef, navigate, basePath))
      expect(onDotClick).not.toBeCalled()
    })
    it('should handle popover ref unavailable', () => {
      const { eChartsRef } = testHelpers()
      const onDotClick = jest.fn()
      const popoverRef = undefined as unknown as RefObject<HTMLDivElement>
      const navigate = jest.fn()
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef, navigate, basePath))
      expect(onDotClick).not.toBeCalled()
    })
    it('should handle dot onClick for events', () => {
      const { testRect, eChartsRef, mockOnFn, testParams } = testHelpers()
      const onDotClick = jest.fn()
      const popoverRef = { current: {
        getBoundingClientRect: jest.fn(() => testRect)
      } } as unknown as RefObject<HTMLDivElement>
      const navigate = jest.fn()
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef, navigate, basePath))
      expect(mockOnFn).toBeCalledTimes(1) // for on
      expect(onDotClick).toBeCalledTimes(1)
      expect(onDotClick).toBeCalledWith({ ...(testParams.data[2] as Event), x: 30, y: 10 })
    })
    it('should handle dot onClick for incidents', () => {
      const params = {
        componentSubType: 'custom',
        seriesName: 'incidents',
        data: [1234, 'all', 1234, { id: '1234' }]
      }
      const { eChartsRef, mockOnFn } = testHelpers(params)
      const onDotClick = jest.fn()
      const popoverRef = undefined as unknown as RefObject<HTMLDivElement>
      const navigate = jest.fn()
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef, navigate, basePath))
      expect(mockOnFn).toBeCalledTimes(1)
      expect(onDotClick).toBeCalledTimes(0)
    })
    it('should not handle onClick for other element', () => {
      const testParams = {
        componentSubType: 'other',
        data: [1654423052112, 'connectionEvents', { id: 0 }]
      }
      const { mockOnFn, eChartsRef } = testHelpers(testParams)
      const onDotClick = jest.fn()
      const popoverRef = undefined as unknown as RefObject<HTMLDivElement>
      const navigate = jest.fn()
      renderHook(() => useDotClick(eChartsRef, onDotClick, popoverRef, navigate, basePath))
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
    let onDataZoom: (val: TimeStampRange) => void
    let chartBoundary =
      [moment('01/02/2023').valueOf(), moment('01/01/2023').valueOf()] as [number, number]
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
      onDataZoom = jest.fn() as unknown as (val: TimeStampRange) => void
    })

    it('does not dispatch action to select zoom if zoom is not enabled', () => {
      renderHook(() => useDataZoom(eChartsRef, false, chartBoundary, onDataZoom))
      expect(mockDispatchAction).not.toBeCalled()
    })

    it('dispatches action to select zoom', () => {
      renderHook(() => useDataZoom(eChartsRef, true, chartBoundary, onDataZoom))
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
        const [, resetZoomCallback] = useDataZoom(eChartsRef, true, chartBoundary, onDataZoom)
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
        const [, callback] = useDataZoom(eChartsRef, true, chartBoundary, onDataZoom)
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
