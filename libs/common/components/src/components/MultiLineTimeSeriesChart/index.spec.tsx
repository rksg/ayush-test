import { RefObject } from 'react'

import { ECharts }  from 'echarts'
import ReactECharts from 'echarts-for-react'


import { mockDOMWidth, render, renderHook } from '@acx-ui/test-utils'
import { TimeStamp }                        from '@acx-ui/types'

import { getSeriesData } from './stories'

import {
  useBrush,
  useOnBrushChange,
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

  it('should render with additional props', () => {
    const formatter = jest.fn()
    render(<MultiLineTimeSeriesChart
      data={getSeriesData()}
      dataFormatter={formatter}
      disableLegend={true}
    />)
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
      areas: [{ coordRange: ['2022-09-07', '2022-09-07'] as [TimeStamp, TimeStamp] }]
    }
    renderHook(() => useOnBrushChange(OnBrushChange)(params))
    expect(OnBrushChange).toBeCalledTimes(1)
    expect(OnBrushChange).toBeCalledWith(['2022-09-07', '2022-09-07'])
  })
})

describe('useOnMarkedAreaClick', () => {
  it('handles eChartsRef = null', async () => {
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
