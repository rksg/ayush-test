import { RefObject } from 'react'

import ReactECharts from 'echarts-for-react'

import { getSeriesData }      from '@acx-ui/analytics/utils'
import { render, renderHook } from '@acx-ui/test-utils'
import { TimeStamp }          from '@acx-ui/types'


import {
  useBrush,
  useOnBrushChange,
  MultiLineTimeSeriesChart
} from '.'

const seriesMapping = [
  { key: 'newClientCount', name: 'New Clients' },
  { key: 'impactedClientCount', name: 'Impacted Clients' },
  { key: 'connectedClientCount', name: 'Connected Clients' }
] as Array<{ key: string, name: string }>

const sample = {
  time: [
    '2022-04-07T09:15:00.000Z',
    '2022-04-07T09:30:00.000Z',
    '2022-04-07T09:45:00.000Z',
    '2022-04-07T10:00:00.000Z',
    '2022-04-07T10:15:00.000Z'
  ] as TimeStamp[],
  newClientCount: [1, 2, 3, 4, 5],
  impactedClientCount: [6, 7, 8, 9, 10],
  connectedClientCount: [11, 12, 13, 14, 15]
}

const validBrushData = getSeriesData(sample, seriesMapping)

describe('MultiLineTimeSeriesChart',()=>{
  it('should call formatter for yAxis', () => {
    const formatter = jest.fn()
    render(<MultiLineTimeSeriesChart
      data={getSeriesData(sample, seriesMapping)}
      dataFormatter={formatter}
    />)
    expect(formatter).toBeCalled()
  })
})

describe('useBrush', () => {
  it('should handle echart ref unavailable', () => {
    const eChartsRef = {} as RefObject<ReactECharts>
    renderHook(() => useBrush(eChartsRef, ['2022-09-07', '2022-09-07'], validBrushData))
  })
  it('should handle brush props unavailable', () => {
    const mockDispatchActionFn = jest.fn() as unknown as ((payload: unknown, opt?: boolean | {
      silent?: boolean;
      flush?: boolean | undefined;
    }) => void)
    const eChartsRef = {
      current: { getEchartsInstance: ()=>({ dispatchAction: mockDispatchActionFn }) }
    } as RefObject<ReactECharts>
    renderHook(() => useBrush(eChartsRef, undefined, undefined))
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
    renderHook(() => useBrush(eChartsRef, ['2022-09-07', '2022-09-07'], validBrushData))
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

  it('should handle invalid brushes', () => {
    const OnBrushChange = jest.fn()
    const params = undefined as unknown as { areas: { coordRange: [TimeStamp, TimeStamp]; }[]; }
    renderHook(() => useOnBrushChange(OnBrushChange)(params))
    expect(OnBrushChange).toBeCalledTimes(0)
  })
})
