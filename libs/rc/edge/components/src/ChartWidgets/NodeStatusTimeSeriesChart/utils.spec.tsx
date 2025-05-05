/* eslint-disable max-len */
import { CallbackDataParams } from 'echarts/types/dist/shared'

import { NodeStatusData }                                                from './type'
import { tooltipOptions, defaultNodeStatusLabelFormatter, getChartData } from './utils'

// Mock components and formatter
jest.mock('@acx-ui/components', () => ({
  cssNumber: jest.fn(val => val),
  cssStr: jest.fn(val => val)
}))

describe('NodeStatusTimeSeriesChart utils', () => {
  describe('tooltipOptions', () => {
    it('should return tooltip configuration with correct styles', () => {
      const options = tooltipOptions()
      expect(options).toEqual({
        textStyle: {
          color: '--acx-primary-white',
          fontFamily: '--acx-neutral-brand-font',
          fontSize: '--acx-body-5-font-size',
          lineHeight: '--acx-body-5-line-height',
          fontWeight: '--acx-body-font-weight'
        },
        backgroundColor: '--acx-primary-black',
        borderRadius: 2,
        borderWidth: 0,
        padding: 8,
        confine: false,
        extraCssText: 'box-shadow: 0px 4px 8px rgba(51, 51, 51, 0.08); z-index: 6;'
      })
    })
  })

  describe('defaultNodeStatusLabelFormatter', () => {
    it('should format tooltip with connected status', () => {
      const nodes: NodeStatusData[] = [
        {
          nodeId: 'node1',
          nodeName: 'Node 1',
          data: [
            ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green']
          ]
        }
      ]

      const params = {
        value: ['2023-01-01T11:00:00']
      } as unknown as CallbackDataParams

      const result = defaultNodeStatusLabelFormatter(nodes, params)
      expect(result).toBe('01/01/2023 11:00<br/>Node 1: Connected<br/>')
    })

    it('should format tooltip with disconnected status', () => {
      const nodes: NodeStatusData[] = [
        {
          nodeId: 'node1',
          nodeName: 'Node 1',
          data: [
            ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 0, 'red']
          ]
        }
      ]

      const params = {
        value: ['2023-01-01T11:00:00']
      } as unknown as CallbackDataParams

      const result = defaultNodeStatusLabelFormatter(nodes, params)
      expect(result).toBe('01/01/2023 11:00<br/>Node 1: Disconnected<br/>')
    })

    it('should format tooltip with "Not Available" status when time not in range', () => {
      const nodes: NodeStatusData[] = [
        {
          nodeId: 'node1',
          nodeName: 'Node 1',
          data: [
            ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green']
          ]
        }
      ]

      const params = {
        value: ['2023-01-01T13:00:00']
      } as unknown as CallbackDataParams

      const result = defaultNodeStatusLabelFormatter(nodes, params)
      expect(result).toBe('01/01/2023 13:00<br/>Node 1: Not Available<br/>')
    })

    it('should format tooltip with multiple nodes', () => {
      const nodes: NodeStatusData[] = [
        {
          nodeId: 'node1',
          nodeName: 'Node 1',
          data: [
            ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green']
          ]
        },
        {
          nodeId: 'node2',
          nodeName: 'Node 2',
          data: [
            ['2023-01-01T09:00:00', 'node2', '2023-01-01T11:00:00', 0, 'red']
          ]
        }
      ]

      const params = {
        value: ['2023-01-01T10:30:00']
      } as unknown as CallbackDataParams

      const result = defaultNodeStatusLabelFormatter(nodes, params)
      expect(result).toBe('01/01/2023 10:30<br/>Node 1: Connected<br/>Node 2: Disconnected<br/>')
    })

    it('should format tooltip with non-array value', () => {
      const nodes: NodeStatusData[] = [
        {
          nodeId: 'node1',
          nodeName: 'Node 1',
          data: [
            ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green']
          ]
        }
      ]

      const params = {
        value: '2023-01-01T11:00:00'
      } as unknown as CallbackDataParams

      const result = defaultNodeStatusLabelFormatter(nodes, params)
      expect(result).toBe('01/01/2023 11:00<br/>Node 1: Connected<br/>')
    })

    it('should handle empty node data', () => {
      const nodes: NodeStatusData[] = [
        {
          nodeId: 'node1',
          nodeName: 'Node 1',
          data: []
        }
      ]

      const params = {
        value: ['2023-01-01T11:00:00']
      } as unknown as CallbackDataParams

      const result = defaultNodeStatusLabelFormatter(nodes, params)
      expect(result).toBe('01/01/2023 11:00<br/>Node 1: Not Available<br/>')
    })
  })

  describe('getChartData', () => {
    it('should handle empty node data', () => {
      const node: NodeStatusData = {
        nodeId: 'node1',
        nodeName: 'Node 1',
        data: []
      }
      const chartBoundary: [string, string] = ['2023-01-01T00:00:00', '2023-01-02T00:00:00']

      const result = getChartData(node, chartBoundary)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual([
        chartBoundary[0],
        'node1',
        chartBoundary[1],
        null,
        '--acx-neutrals-30'
      ])
    })

    it('should handle single data point', () => {
      const node: NodeStatusData = {
        nodeId: 'node1',
        nodeName: 'Node 1',
        data: [
          ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green']
        ]
      }
      const chartBoundary: [string, string] = ['2023-01-01T00:00:00', '2023-01-02T00:00:00']

      const result = getChartData(node, chartBoundary)
      expect(result).toHaveLength(3)

      // Should create 'Not Available' segment from chart start to first data point
      expect(result[0]).toEqual(['2023-01-01T00:00:00', 'node1', '2023-01-01T10:00:00', null, '--acx-neutrals-30'])

      // Should include the data point
      expect(result[1]).toEqual(['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green'])

      // Should create 'Not Available' segment from last data point to chart end
      expect(result[2]).toEqual(['2023-01-01T12:00:00', 'node1', '2023-01-02T00:00:00', null, '--acx-neutrals-30'])
    })

    it('should handle multiple continuous data points', () => {
      const node: NodeStatusData = {
        nodeId: 'node1',
        nodeName: 'Node 1',
        data: [
          ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green'],
          ['2023-01-01T12:00:00', 'node1', '2023-01-01T14:00:00', 0, 'red']
        ]
      }
      const chartBoundary: [string, string] = ['2023-01-01T09:00:00', '2023-01-01T15:00:00']

      const result = getChartData(node, chartBoundary)
      expect(result).toHaveLength(4)

      // Gap before first data
      expect(result[0]).toEqual(['2023-01-01T09:00:00', 'node1', '2023-01-01T10:00:00', null, '--acx-neutrals-30'])

      // First data point
      expect(result[1]).toEqual(['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green'])

      // Second data point
      expect(result[2]).toEqual(['2023-01-01T12:00:00', 'node1', '2023-01-01T14:00:00', 0, 'red'])

      // Gap after last data
      expect(result[3]).toEqual(['2023-01-01T14:00:00', 'node1', '2023-01-01T15:00:00', null, '--acx-neutrals-30'])
    })

    it('should handle multiple data points with gaps', () => {
      const node: NodeStatusData = {
        nodeId: 'node1',
        nodeName: 'Node 1',
        data: [
          ['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green'],
          ['2023-01-01T13:00:00', 'node1', '2023-01-01T14:00:00', 0, 'red']
        ]
      }
      const chartBoundary: [string, string] = ['2023-01-01T09:00:00', '2023-01-01T15:00:00']

      const result = getChartData(node, chartBoundary)
      expect(result).toHaveLength(5)

      // Gap before first data
      expect(result[0]).toEqual(['2023-01-01T09:00:00', 'node1', '2023-01-01T10:00:00', null, '--acx-neutrals-30'])

      // First data point
      expect(result[1]).toEqual(['2023-01-01T10:00:00', 'node1', '2023-01-01T12:00:00', 1, 'green'])

      // Gap between data points
      expect(result[2]).toEqual(['2023-01-01T12:00:00', 'node1', '2023-01-01T13:00:00', null, '--acx-neutrals-30'])

      // Second data point
      expect(result[3]).toEqual(['2023-01-01T13:00:00', 'node1', '2023-01-01T14:00:00', 0, 'red'])

      // Gap after last data
      expect(result[4]).toEqual(['2023-01-01T14:00:00', 'node1', '2023-01-01T15:00:00', null, '--acx-neutrals-30'])
    })

    it('should handle data that covers the entire chart boundary', () => {
      const node: NodeStatusData = {
        nodeId: 'node1',
        nodeName: 'Node 1',
        data: [
          ['2023-01-01T09:00:00', 'node1', '2023-01-01T15:00:00', 1, 'green']
        ]
      }
      const chartBoundary: [string, string] = ['2023-01-01T09:00:00', '2023-01-01T15:00:00']

      const result = getChartData(node, chartBoundary)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(['2023-01-01T09:00:00', 'node1', '2023-01-01T15:00:00', 1, 'green'])
    })
  })
})
