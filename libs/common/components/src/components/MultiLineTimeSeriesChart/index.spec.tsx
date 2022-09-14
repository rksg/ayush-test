import { RefObject } from 'react'

import ReactECharts      from 'echarts-for-react'
import { BrowserRouter } from 'react-router-dom'


import { render, renderHook } from '@acx-ui/test-utils'
import { TimeStamp }          from '@acx-ui/types'

import { getSeriesData } from './stories'

import {
  useBrush,
  useOnBrushChange,
  MultiLineTimeSeriesChart
} from '.'


describe('MultiLineTimeSeriesChart', () => {
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<BrowserRouter>
      <MultiLineTimeSeriesChart
        data={getSeriesData()}
        dataFormatter={formatter}
      />
    </BrowserRouter>)
    expect(formatter).toBeCalled()
  })

  it('should render with additional props', () => {
    const formatter = jest.fn()
    render(<BrowserRouter>
      <MultiLineTimeSeriesChart
        data={getSeriesData()}
        dataFormatter={formatter}
        disableLegend={true}
      />
    </BrowserRouter>)
    expect(formatter).toBeCalled()
  })
})

describe('useBrush', () => {
  it('should handle echart ref unavailable', () => {
    const eChartsRef = {} as RefObject<ReactECharts>
    renderHook(() => useBrush(eChartsRef, ['2022-09-07', '2022-09-07']))
  })
  it('should handle brush props unavailable', () => {
    const mockDispatchActionFn = jest.fn() as unknown as ((payload: unknown, opt?: boolean | {
      silent?: boolean;
      flush?: boolean | undefined;
    }) => void)
    const eChartsRef = {
      current: { getEchartsInstance: ()=>({ dispatchAction: mockDispatchActionFn }) }
    } as RefObject<ReactECharts>
    renderHook(() => useBrush(eChartsRef, undefined))
    expect(eChartsRef.current?.getEchartsInstance().dispatchAction).not.toBeCalled()
  })
  it('should dispatch action for brush', () => {
    const mockDispatchActionFn = jest.fn() as unknown as ((payload: unknown, opt?: boolean | {
      silent?: boolean;
      flush?: boolean | undefined;
    }) => void)
    const eChartsRef = {
      current: { getEchartsInstance: ()=>({ dispatchAction: mockDispatchActionFn }) }
    } as RefObject<ReactECharts>
    renderHook(() => useBrush(eChartsRef, ['2022-09-07', '2022-09-07']))
    expect(mockDispatchActionFn).toBeCalledTimes(1)
    expect(mockDispatchActionFn).toBeCalledWith({
      type: 'brush',
      areas: [{
        brushType: 'lineX',
        coordRange: ['2022-09-07', '2022-09-07'],
        xAxisIndex: 0
      }]
    })
  })
})

describe('useOnBrushChange', () => {
  it('should call OnBrushChange',() => {
    const OnBrushChange = jest.fn()
    const params = {
      batch: [{ areas: [{ coordRange: ['2022-09-07', '2022-09-07'] as [TimeStamp, TimeStamp] }] }]
    }
    renderHook(() => useOnBrushChange(OnBrushChange)(params))
    expect(OnBrushChange).toBeCalledTimes(1)
    expect(OnBrushChange).toBeCalledWith(['2022-09-07', '2022-09-07'])
  })
})
