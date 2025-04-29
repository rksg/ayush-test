import React from 'react'

import ReactECharts from 'echarts-for-react'

import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'
import '@testing-library/jest-dom'

import { NodeStatusTimeSeriesChart } from '../index'
import { NodeStatusData }            from '../type'

// Mock dependencies
jest.mock('../utils', () => {
  const originalModule = jest.requireActual('../utils')
  return {
    ...originalModule,
    tooltipOptions: jest.fn().mockReturnValue({
      trigger: 'axis',
      confine: true
    }),
    defaultNodeStatusLabelFormatter: jest.fn().mockReturnValue('Formatted tooltip'),
    getChartData: jest.fn().mockImplementation(() => [
      [1621600000000, 'node1', 1621610000000, 1, '#00FF00'],
      [1621610000000, 'node1', 1621620000000, 2, '#FF0000']
    ])
  }
})

// Test fixtures
const mockNodeData: NodeStatusData[] = [
  {
    key: 'node1',
    nodeName: 'Node 1',
    nodeId: 'sn1',
    data: [
      [1621600000000, 'node1', 1621610000000, 1, '#00FF00' ],
      [1621610000000, 'node1', 1621620000000, 0, '#FF0000' ]
    ]
  },
  {
    key: 'node2',
    nodeName: 'Node 2',
    nodeId: 'sn2',
    data: [
      [1621600000000, 'node2', 1621615000000, 0, '#00FF00' ],
      [1621615000000, 'node2', 1621620000000, 1, '#FFFF00' ]
    ]
  }
]

describe('NodeStatusTimeSeriesChart Component', () => {
  it('should render correctly', async () => {
    render(
      <NodeStatusTimeSeriesChart
        style={{ width: 504, height: 300 }}
        nodes={mockNodeData}
        chartBoundary={[1595829463000, 1609048663000]}
        hasXaxisLabel
      />
    )
    const chart = await screen.findByTestId('NodeStatusTimeSeriesChart')
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
      <NodeStatusTimeSeriesChart
        nodes={mockNodeData}
        chartBoundary={[1595829463000, 1609048663000]}
        chartRef={mockCallbackRef}
      />
    )
    await waitFor(() => {
      expect(createHandleCallback()).not.toBeNull()
    })

    jest.restoreAllMocks()
  })

  it('should render with label & tooltip formatter', () => {
    const tooltipFormatter = jest.fn(() => 'tooltip')
    const labelFormatter = jest.fn(() => 'label')
    const mockedDispatch = jest.fn(() => true)
    const useStateSpy = jest.spyOn(React, 'useState')
    useStateSpy.mockImplementation(() => [true, mockedDispatch])
    render(
      <NodeStatusTimeSeriesChart
        nodes={mockNodeData}
        chartBoundary={[1595829463000, 1609048663000]}
        tooltipFormatter={tooltipFormatter}
        labelFormatter={labelFormatter}
      />
    )
  })
})