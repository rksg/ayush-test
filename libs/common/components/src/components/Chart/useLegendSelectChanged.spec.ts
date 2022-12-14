import { RefObject } from 'react'

import { renderHook } from '@testing-library/react'
import { ECharts }    from 'echarts'
import ReactECharts   from 'echarts-for-react'

import { useLegendSelectChanged } from './useLegendSelectChanged'

describe('useLegendSelectChanged', () => {
  it('handles eChartsRef = null', async () => {
    const eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => useLegendSelectChanged(eChartsRef))

    // intentionally left blank to cover the line where echart ref is null
  })

  it('should dispatch action for legends', () => {
    const callbacks: Array<(params: unknown) => void> = []
    const on = jest.fn().mockImplementation((
      _0: string,
      callback: ((params: unknown) => void)
    ) => callbacks.push(callback))
    const mockDispatchActionFn = jest.fn() as unknown as ((payload: unknown, opt?: boolean | {
      silent?: boolean;
      flush?: boolean | undefined;
    }) => void)

    const instance = { on, dispatchAction: mockDispatchActionFn } as unknown as ECharts
    const eChartsRef = {
      current: { getEchartsInstance: () => instance }
    } as RefObject<ReactECharts>

    renderHook(() => useLegendSelectChanged(
      eChartsRef
    ))
    expect(on).toBeCalledWith('legendselectchanged', expect.any(Function))
    expect(callbacks).toHaveLength(1)

    callbacks[0]({
      name: 'abc',
      type: 'legendselectchanged',
      selected: {
        series1: false,
        series2: false
      }
    })
    renderHook(() => useLegendSelectChanged(eChartsRef))
    expect(mockDispatchActionFn).toBeCalledTimes(1)
    expect(mockDispatchActionFn).toBeCalledWith({
      type: 'legendAllSelect'
    })

    // This case is added to cover else case, where dispatch should not be called
    jest.resetAllMocks()
    callbacks[0]({
      name: 'abc',
      type: 'legendselectchanged',
      selected: {
        series1: false,
        series2: true
      }
    })
    renderHook(() => useLegendSelectChanged(eChartsRef))
    expect(mockDispatchActionFn).toBeCalledTimes(0)
  })
})