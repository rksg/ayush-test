import { RefObject } from 'react'

import { renderHook } from '@testing-library/react'
import { ECharts }    from 'echarts'
import ReactECharts   from 'echarts-for-react'

import { useOnAxisLabelClick } from './useOnAxisLabelClick'

describe('useLegendSelectChanged', () => {
  it('handles eChartsRef = null', async () => {
    const eChartsRef = { current: null } as RefObject<ReactECharts>
    renderHook(() => useOnAxisLabelClick(eChartsRef))

    // intentionally left blank to cover the line where echart ref is null
  })

  it('should call the handler with axis label name', () => {
    const callbacks: Array<(params: unknown) => void> = []
    const on = jest.fn().mockImplementation((
      _0: string,
      callback: ((params: unknown) => void)
    ) => callbacks.push(callback))
    const onAxisLabelClickMock = jest.fn()

    const instance = { on } as unknown as ECharts
    const eChartsRef = {
      current: { getEchartsInstance: () => instance }
    } as RefObject<ReactECharts>

    renderHook(() => useOnAxisLabelClick(
      eChartsRef, onAxisLabelClickMock
    ))
    expect(on).toBeCalledWith('click', expect.any(Function))
    expect(callbacks).toHaveLength(1)

    callbacks[0]({
      targetType: 'axisLabel',
      value: 'someLabel'
    })

    renderHook(() => useOnAxisLabelClick(eChartsRef, onAxisLabelClickMock))
    expect(onAxisLabelClickMock).toBeCalledTimes(1)
    expect(onAxisLabelClickMock).toBeCalledWith('someLabel')

    // This case is added to cover else case, where dispatch should not be called
    jest.resetAllMocks()
    callbacks[0]({
      targetType: 'notAxisLabel',
      value: 'someLabel'
    })
    renderHook(() => useOnAxisLabelClick(eChartsRef, onAxisLabelClickMock))
    expect(onAxisLabelClickMock).toBeCalledTimes(0)
  })
})
