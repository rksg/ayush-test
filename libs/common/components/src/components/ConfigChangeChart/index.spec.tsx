import React from 'react'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { sampleChartBoundary, sampleData } from './__tests__/fixtures'
import * as helper                         from './helper'

import { ConfigChangeChart } from '.'

// jest.mock('./helper')

jest.mock('./helper', () => ({
  ...jest.requireActual('./helper'),
  useDataZoom: jest.fn()
}))

describe('ConfigChangeChart',() => {
  // describe('useBoundaryChange', () => {
  //   it('should handle when boundary change', () => {
  //     const brushPositions = {
  //       actual: [[10, 20], [80, 90]],
  //       show: [[10, 20], [80, 90]]
  //     }
  //     const boundary = { min: 0, max: 100 }
  //     const getZoomPosition = jest.fn(
  //       (boundary, actualBrushPositions, index)=>brushPositions.actual[index])
  //     const setBrushPositions = jest.fn()
  //     const draw = jest.fn()
  //     renderHook(() => useBoundaryChange(
  //       boundary, brushPositions, setBrushPositions, getZoomPosition, draw))
  //     expect(getZoomPosition).toBeCalledTimes(2)
  //     expect(getZoomPosition).toBeCalledWith(boundary, brushPositions.actual, 0)
  //     expect(getZoomPosition).toBeCalledWith(boundary, brushPositions.actual, 1)
  //     expect(setBrushPositions).toBeCalledTimes(1)
  //     expect(setBrushPositions).toBeCalledWith(brushPositions)
  //     expect(draw).toBeCalledTimes(1)
  //     expect(draw).toBeCalledWith(brushPositions)
  //   })
  // })
  // describe('useDatazoom',() => {
  //   it('should return correct boundary',() => {
  //     const chartBoundary = [100, 1100]
  //     const setBoundary = jest.fn(value => value)
  //     renderHook(() => useDatazoom(chartBoundary, setBoundary)({ batch: [{ start: 10, end: 90 }] }))
  //     expect(setBoundary).toBeCalledTimes(1)
  //     expect(setBoundary).toBeCalledWith({ max: 1000, min: 200 })
  //   })
  // })
  // describe('onLegendselectchanged',() => {
  //   it('should return correct selected legends',() => {
  //     const setSelectedLegend = jest.fn(value => value)
  //     const selected = { option1: true, option2: false }
  //     renderHook(() => useLegendSelectChanged(setSelectedLegend)({ selected }))
  //     expect(setSelectedLegend).toBeCalledTimes(1)
  //     expect(setSelectedLegend).toBeCalledWith(selected)
  //   })
  //   it('should select all if no legend is selected',() => {
  //     const setSelectedLegend = jest.fn(value => value)
  //     const selected = { option1: false, option2: false }
  //     renderHook(() => useLegendSelectChanged(setSelectedLegend)({ selected }))
  //     expect(setSelectedLegend).toBeCalledTimes(1)
  //     expect(setSelectedLegend).toBeCalledWith({ option1: true, option2: true })
  //   })
  // })
  describe('ConfigChangeChart',() => {
    it('should render canvas', () => {
      (helper.useDataZoom as unknown as jest.Mock<ReturnType<typeof helper.useDataZoom>>)
        .mockReturnValue({ canResetZoom: false, resetZoomCallback: jest.fn() })
      const { asFragment } = render(<ConfigChangeChart
        style={{ width: 1000 }}
        data={sampleData}
        chartBoundary={sampleChartBoundary}
        onDotClick={jest.fn()}
      />, { wrapper: Provider, route: {} })
      // eslint-disable-next-line testing-library/no-node-access
      expect(asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()
      // eslint-disable-next-line testing-library/no-node-access
      expect(asFragment().querySelector('canvas')).not.toBeNull()
      expect(screen.queryByRole('button', { name: 'Reset Zoom' })).toBeNull()
    })
    it('should render with zoom enabled', () => {
      (helper.useDataZoom as unknown as jest.Mock<ReturnType<typeof helper.useDataZoom>>)
        .mockReturnValue({ canResetZoom: true, resetZoomCallback: jest.fn() })
      render(<ConfigChangeChart
        style={{ width: 1000 }}
        data={sampleData}
        chartBoundary={sampleChartBoundary}
        onDotClick={jest.fn()}
      />, { wrapper: Provider })
      expect(screen.getByRole('button', { name: 'Reset Zoom' })).toBeVisible()
    })
  })
})
