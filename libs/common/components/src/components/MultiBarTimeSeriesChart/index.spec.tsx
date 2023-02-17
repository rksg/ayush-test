import React, { RefObject } from 'react'

import { ECharts }            from 'echarts'
import ReactECharts           from 'echarts-for-react'
import { CallbackDataParams } from 'echarts/types/dist/shared'

import {
  act,
  render,
  waitFor,
  screen,
  cleanup,
  renderHook,
  fireEvent
} from '@acx-ui/test-utils'
import { TimeStamp } from '@acx-ui/types'

import {
  MultiBarTimeSeriesChart,
  useBarchartZoom,
  defaultLabelFormatter
} from '.'

const base = +new Date(2023, 1, 30)

const sampleData = () => {
  const milisInDay = 24 * 3600 * 1000
  const data = [[base, 'SwitchStatus', base + 1000, 1, '#23AB36']]
  for (let i = 1; i < 37; i++) {
    data.push([
      base + milisInDay * i,
      'SwitchStatus',
      base + milisInDay * i + 1000,
      Math.floor(Math.random() * 0) + 1,
      '#23AB36'
    ])
  }
  return data as [TimeStamp, string, TimeStamp, number | null, string][]
}

const getData = () => {
  return [
    {
      key: 'SwitchStatus',
      name: 'switch',
      color: '#23AB36',
      data: sampleData()
    }
  ]
}

type DispatchAction = (
  payload: unknown,
  opt?:
    | boolean
    | {
        silent?: boolean;
        flush?: boolean | undefined;
      }
) => void

describe('MultiBarTimeSeriesChart', () => {
  afterEach(() => cleanup())

  it('should render correctly', async () => {
    render(
      <MultiBarTimeSeriesChart
        style={{ width: 504, height: 300 }}
        data={getData()}
        chartBoundary={[1595829463000, 1609048663000]}
        hasXaxisLabel
        zoomEnabled
      />
    )
    const chart = await screen.findByTestId('MultiBarTimeSeriesChart')
    fireEvent.click(chart)
    expect(chart).not.toBeNull()
  })

  it('should use imperative handle', async () => {
    const mockCallbackRef = jest.fn()
    let createHandleCallback: () => RefObject<ReactECharts>
    jest.spyOn(React, 'useImperativeHandle').mockImplementation((ref, callback) => {
      expect(ref).toEqual(mockCallbackRef)
      createHandleCallback = callback as () => RefObject<ReactECharts>
    })
    render(
      <MultiBarTimeSeriesChart
        data={getData()}
        chartBoundary={[1595829463000, 1609048663000]}
        chartRef={mockCallbackRef}
      />
    )
    await waitFor(() => {
      expect(createHandleCallback()).not.toBeNull()
    })
    jest.restoreAllMocks()
  })

  it('should render with zoom enabled', () => {
    const mockSetCanResetZoom = jest.fn()
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation(() => [true, mockSetCanResetZoom])
    render(
      <MultiBarTimeSeriesChart data={getData()} chartBoundary={[1595829463000, 1609048663000]} />
    )
    expect(screen.getByRole('button', { name: 'Reset Zoom' })).toBeVisible()
  })

  it('should render with label & tooltip formatter', () => {
    const tooltipFormatter = jest.fn(() => 'tooltip')
    const labelFormatter = jest.fn(() => 'label')
    const mockedDispatch = jest.fn(() => true)
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation(() => [true, mockedDispatch])
    render(
      <MultiBarTimeSeriesChart
        data={getData()}
        chartBoundary={[1595829463000, 1609048663000]}
        tooltipFormatter={tooltipFormatter}
        LabelFormatter={labelFormatter}
      />
    )
  })

  it('should show valid tooltip with status', async () => {
    const data = [{ data: sampleData() }]
    const params = { value: 1595829463000 } as CallbackDataParams
    expect(defaultLabelFormatter(data, params)).toContain('Status: Not Available')
  })
  it('should show valid tooltip with connected status', async () => {
    const data = [{ data: sampleData() }]
    const params = { value: new Date(2023, 1, 30) } as CallbackDataParams
    expect(defaultLabelFormatter(data, params)).toContain('Status: Connected')
  })
  it('should show valid tooltip with disconnected status', async () => {
    const data = [
      {
        data: [[base, 'SwitchStatus', base + 1000, 0, '#23AB36']] as [
          TimeStamp,
          string,
          TimeStamp,
          number | null,
          string
        ][]
      }
    ]
    const params = { value: new Date(2023, 1, 30) } as CallbackDataParams
    expect(defaultLabelFormatter(data, params)).toContain('Status: Disconnected')
  })
  describe('useBarchartZoom', () => {
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

    it('handles null echart ref', () => {
      eChartsRef = { current: null } as RefObject<ReactECharts>
      renderHook(() => useBarchartZoom(eChartsRef, true))
      // intentionally no assertion to cover the line where echart ref is null
    })

    it('does not dispatch action to select zoom if zoom is not enabled', () => {
      renderHook(() => useBarchartZoom(eChartsRef, false))
      expect(mockDispatchAction).not.toBeCalled()
    })

    it('dispatches action to select zoom', () => {
      renderHook(() => useBarchartZoom(eChartsRef, true))
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
        const [, resetZoomCallback] = useBarchartZoom(eChartsRef, true)
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
        const [, callback] = useBarchartZoom(eChartsRef, true, mockOnDataZoom)
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
