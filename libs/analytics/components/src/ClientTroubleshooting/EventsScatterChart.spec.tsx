
import { RefObject } from 'react'

import { render, renderHook } from '@testing-library/react'
import ReactECharts           from 'echarts-for-react'

import {
  useDotClick,EventsScatterChart
} from './EventsScatterChart'
describe('EventsScatterChart',() => {
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
      expect(setSelected).toBeCalledWith((testParams.data[2] as ).id)
    })
  })

  describe('EventsScatterChart',() => {
    it('should render canvas', () => {
      const chartBoundary = [1654423052112, 1657015052112]
      const { asFragment } = render(
        <EventsScatterChart
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
