import moment from 'moment'

import * as utils     from '@acx-ui/analytics/utils'
import * as services  from '@acx-ui/rc/services'
import { renderHook } from '@acx-ui/test-utils'

import { useClusterNodesUpTimeData, getStartAndEndTimes } from './useClusterNodesUpTimeData'

// Mock dependencies
jest.mock('@acx-ui/rc/services', () => ({
  useLazyGetEdgeUptimeQuery: jest.fn()
}))

jest.mock('@acx-ui/analytics/utils', () => ({
  calculateGranularity: jest.fn(),
  getSeriesData: jest.fn()
}))

describe('useClusterNodesUpTimeData', () => {
  const mockGetEdgeUptime = jest.fn()
  const mockUnwrap = jest.fn()

  const mockFilters = {
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-01-02T00:00:00Z'
  }

  const mockSerialNumbers = ['SN1', 'SN2']

  const mockTimeSeriesData = [
    {
      data: [
        ['2023-01-01T00:00:00Z', 1],
        ['2023-01-01T01:00:00Z', 1],
        ['2023-01-01T02:00:00Z', 0],
        ['2023-01-01T03:00:00Z', 0],
        ['2023-01-01T04:00:00Z', 1]
      ]
    }
  ]

  // const mockTransformedData = [
  //   ['2023-01-01T00:00:00Z', 'edgeStatus', '2023-01-01T01:00:00Z', 1, 'green'],
  //   ['2023-01-01T02:00:00Z', 'edgeStatus', '2023-01-01T03:00:00Z', 0, 'red'],
  //   ['2023-01-01T04:00:00Z', 'edgeStatus', '2023-01-01T04:00:00Z', 1, 'green']
  // ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mocks
    // jest.spyOn(reactIntl, 'useIntl').mockReturnValue(mockIntl as any)

    mockGetEdgeUptime.mockReturnValue({
      unwrap: mockUnwrap
    })

    jest.spyOn(services, 'useLazyGetEdgeUptimeQuery').mockReturnValue([
      mockGetEdgeUptime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as any)

    jest.spyOn(utils, 'calculateGranularity').mockReturnValue('1h')
    jest.spyOn(utils, 'getSeriesData').mockReturnValue(mockTimeSeriesData)
  })

  test('should return empty results with empty serialNumbers', async () => {
    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: [],
        filters: mockFilters
      })
    )

    expect(result.current.queryResults).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(mockGetEdgeUptime).not.toHaveBeenCalled()
  })

  test('should return empty results with undefined serialNumbers', async () => {
    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: undefined,
        filters: mockFilters
      })
    )

    expect(result.current.queryResults).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(mockGetEdgeUptime).not.toHaveBeenCalled()
  })

  test('should fetch and process data successfully', async () => {
    // Mock getStartAndEndTimes function by mocking its result
    const mockEdgeUpTimeData = {
      timeSeries: [
        {
          time: '2023-01-01T00:00:00Z',
          isEdgeUp: 1
        },
        {
          time: '2023-01-01T01:00:00Z',
          isEdgeUp: 0
        }
      ],
      totalUptime: 3600,
      totalDowntime: 3600
    }

    mockUnwrap.mockResolvedValueOnce({
      ...mockEdgeUpTimeData
    }).mockResolvedValueOnce({
      ...mockEdgeUpTimeData,
      totalUptime: 7200,
      totalDowntime: 0
    })

    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: mockSerialNumbers,
        filters: mockFilters
      })
    )

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Not loading anymore
    expect(result.current.isLoading).toBe(false)

    // Check if API was called with correct params
    expect(mockGetEdgeUptime).toHaveBeenCalledTimes(2)
    expect(mockGetEdgeUptime).toHaveBeenCalledWith({
      params: { serialNumber: 'SN1' },
      payload: {
        start: mockFilters.startDate,
        end: mockFilters.endDate,
        granularity: '1h'
      }
    })

    // Check if results were processed correctly
    expect(result.current.queryResults.length).toBe(2)
    expect(result.current.queryResults[0].serialNumber).toBe('SN1')
    expect(result.current.queryResults[1].serialNumber).toBe('SN2')

  })

  test('should handle API error', async () => {
    mockUnwrap.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: mockSerialNumbers,
        filters: mockFilters
      })
    )

    expect(result.current.queryResults).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  test('should handle rejected promises', async () => {
    mockUnwrap.mockResolvedValueOnce({
      timeSeries: [],
      totalUptime: 0,
      totalDowntime: 0
    })

    mockGetEdgeUptime.mockReturnValueOnce({
      unwrap: mockUnwrap
    }).mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('Failed request'))
    })

    const { result } = renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: mockSerialNumbers,
        filters: mockFilters
      })
    )

    expect(result.current.queryResults.length).toBe(1)
    expect(result.current.isLoading).toBe(false)
  })

  test('getStartAndEndTimes transforms time series data correctly', () => {
    const result = getStartAndEndTimes(mockTimeSeriesData)

    expect(result).toHaveLength(3)

    // Check first data point (start of period 1)
    expect(result[0][0]).toBe('2023-01-01T00:00:00Z') // start time
    expect(result[0][1]).toBe('edgeStatus')
    expect(result[0][2]).toBe('2023-01-01T01:00:00Z') // end time
    expect(result[0][3]).toBe(1) // value

    // Check status change to 0
    expect(result[1][0]).toBe('2023-01-01T02:00:00Z')
    expect(result[1][3]).toBe(0)

    // Check status change back to 1
    expect(result[2][0]).toBe('2023-01-01T04:00:00Z')
    expect(result[2][3]).toBe(1)
  })

  test('should handle time boundary adjustments', async () => {
    // Mock the moment operations for time boundary adjustments
    const originalMoment = moment
    const mockMomentInstance = {
      add: jest.fn().mockReturnThis(),
      toISOString: jest.fn().mockReturnValue('2023-01-01T05:00:00Z')
    }
    global.moment = jest.fn((...args) => {
      if (args.length) {
        return {
          ...mockMomentInstance,
          add: mockMomentInstance.add,
          toISOString: mockMomentInstance.toISOString
        }
      }
      return {
        duration: jest.fn().mockReturnValue({
          asSeconds: jest.fn().mockReturnValue(3600)
        })
      }
    })

    mockUnwrap.mockResolvedValueOnce({
      timeSeries: [],
      totalUptime: 3600,
      totalDowntime: 3600
    })

    // Setup specific mock of getSeriesData to test the map function
    jest.spyOn(utils, 'getSeriesData').mockReturnValueOnce([{
      data: [['2023-01-01T00:00:00Z', 1]]
    }])

    renderHook(() =>
      useClusterNodesUpTimeData({
        serialNumbers: ['SN1'],
        filters: mockFilters
      })
    )

    expect(mockMomentInstance.add).toHaveBeenCalledWith(3600, 'seconds')

    // Restore mocks
    global.moment = originalMoment
  })
})
